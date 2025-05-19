import * as core from "@actions/core";
import * as github from "@actions/github";
import { Logger } from "./logger.js";
// Use require for js-yaml to avoid module resolution issues
const yaml = require("js-yaml");
// Use require for glob to avoid module resolution issues
const { glob } = require("glob");
import { Validator } from "jsonschema";
import { readFile, readdir, writeFile, unlink, stat } from "fs/promises";
import { join, basename, dirname } from "path";

// Schema resolution is handled via process.cwd()

// Define the schema type
type SchemaType = {
  type: string | string[];
  required?: string[];
  properties?: Record<string, SchemaType>;
  additionalProperties?: boolean | SchemaType;
  [key: string]: unknown; // Allow additional properties
};

// Define the ticket schema type
type TicketSchema = SchemaType & {
  type: "object";
  required: string[];
  properties: Record<string, SchemaType>;
  additionalProperties: boolean;
};

// Load schema file
const schemaPath = join(process.cwd(), "schemas/ticket-schema.json");
const schema = JSON.parse(await readFile(schemaPath, "utf-8")) as TicketSchema;

interface ChildTicket {
  id: string;
  title: string;
}

interface TechnicalDetails {
  architecture?: string[];
  performance?: string[];
  security?: string[];
  [key: string]: unknown;
}

interface Ticket {
  title: string;
  description: string;
  child_tickets?: ChildTicket[];
  acceptance_criteria?: string[];
  technical_details?: TechnicalDetails;
  sub_tasks?: string[];
  dependencies?: string[];
  estimated_time?: string;
  complexity?: string;
  change_impact?: string;
  [key: string]: unknown;
}

function validateTicket(ticket: unknown, filePath: string): ticket is Ticket {
  try {
    const validator = new Validator();
    const result = validator.validate(ticket, schema);

    if (!result.valid) {
      core.error(`Validation error in ${filePath}:`);
      result.errors.forEach((error) => {
        core.error(`  - ${error.property}: ${error.message}`);
      });
      return false;
    }

    return true;
  } catch (error) {
    core.error(
      `Error validating ticket in ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

// parseBoolean function removed as it's not being used

function normalizePath(inputPath: string, baseDir: string): string {
  // If path is absolute, return as is
  if (inputPath.startsWith("/")) {
    return inputPath;
  }
  // If path is relative, resolve against base directory
  const resolvedPath = join(baseDir, inputPath);
  core.debug(`Normalized path: ${inputPath} -> ${resolvedPath}`);
  return resolvedPath;
}

function ensureTrailingSlash(inputPath: string): string {
  if (!inputPath.endsWith("/") && !inputPath.endsWith("\\")) {
    return `${inputPath}/`;
  }
  return inputPath;
}

async function run(): Promise<void> {
  // Helper function to safely get boolean input
  const getBooleanInput = (name: string, defaultValue = false): boolean => {
    const value = core.getInput(name);
    if (value === "") return defaultValue;
    return value === "true" || value === "True" || value === "TRUE";
  };

  // Initialize logger first thing
  const debugMode = getBooleanInput("debug");
  const logger = Logger.getInstance(debugMode);

  try {
    const token = core.getInput("token", { required: true });
    const ticketsPathInput = core.getInput("tickets-path") || "tickets/";
    const dryRun = getBooleanInput("dry-run");

    logger.banner("🚀 Starting GitHub Issues Sync");
    if (debugMode) {
      logger.debug("Debug mode enabled");
      logger.debug("Input parameters:", {
        ticketsPath: ticketsPathInput,
        dryRun,
        debug: debugMode,
      });
    }

    // Normalize the tickets path
    const ticketsPath = normalizePath(ticketsPathInput, process.cwd());
    const normalizedPath = ensureTrailingSlash(ticketsPath);

    // Initialize GitHub client
    const octokit = github.getOctokit(token);
    const { repo, owner } = github.context.repo;

    logger.debug(`Current working directory: ${process.cwd()}`);
    logger.info(`Looking for YAML files in: ${ticketsPath}`, "🔍");

    // Check if directory exists and is accessible
    try {
      const stats = await stat(ticketsPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${ticketsPath}`);
      }

      // List directory contents for debugging
      const files = await readdir(ticketsPath, { withFileTypes: true });
      const fileList = files
        .map(
          (dirent: {
            isDirectory: () => boolean;
            name: string;
            isSymbolicLink: () => boolean;
          }) =>
            `  ${dirent.isDirectory() ? "📁" : "📄"} ${dirent.name}${dirent.isSymbolicLink() ? " (symlink)" : ""}`,
        )
        .join("\n");
      logger.debug(`Directory contents (${files.length} items):\n${fileList}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      core.error(`Error accessing directory ${ticketsPath}: ${errorMessage}`);
      core.error(`Current working directory: ${process.cwd()}`);
      core.error(`Resolved path: ${ticketsPath}`);
      throw new Error(
        `Directory does not exist or is not accessible: ${ticketsPath}`,
      );
    }

    // Normalize the path ends with a path separator for glob
    const pattern = `${normalizedPath}*.yaml`;
    logger.debug(`Using glob pattern: ${pattern}`);

    // Log glob options for debugging
    logger.debug("Glob options:", {
      absolute: true,
      cwd: normalizedPath,
      nodir: true,
    });

    // Find YAML files
    const yamlFiles = await glob(pattern, {
      absolute: true,
      cwd: normalizedPath,
      nodir: true,
    });

    // Log found files
    if (yamlFiles.length > 0) {
      logger.success(`Found ${yamlFiles.length} YAML file(s) to process`);
      if (logger.isDebugEnabled()) {
        yamlFiles.forEach((file: string, index: number) => {
          logger.debug(`${index + 1}. ${file}`);
        });
      }
    } else {
      logger.warn(`No YAML files found matching pattern: ${pattern}`);
      logger.debug(`Searched in: ${normalizedPath}`);
      return;
    }

    for (const filePath of yamlFiles) {
      const fileName = basename(filePath);
      logger.startGroup(`Processing: ${fileName}`);

      try {
        logger.debug(`File path: ${filePath}`);
        const fileContent = await readFile(filePath, "utf8");
        logger.debug(`File size: ${fileContent.length} characters`);

        let ticket: unknown;
        try {
          logger.debug("Parsing YAML content...");
          ticket = yaml.load(fileContent);
          logger.debug("YAML parsed successfully");

          if (!ticket || typeof ticket !== "object") {
            throw new Error("Invalid YAML format: expected an object");
          }

          // Convert legacy format if needed
          const ticketObj = ticket as Record<string, unknown>;
          if ("ticket" in ticketObj) {
            logger.info(`Converting legacy format for ${fileName}`, "🔄");
            ticket = convertLegacyFormat(ticketObj);
            logger.debug("Legacy format conversion complete");
          }

          // Validate against schema
          logger.debug("Validating ticket structure...");
          if (!validateTicket(ticket as Ticket, filePath)) {
            logger.warn(`Skipping ${fileName}: Validation failed`);
            logger.endGroup();
            continue;
          }

          const ticketSummary = ticket as Ticket;
          logger.info(
            `Processing: ${ticketSummary.title || "Untitled Ticket"}`,
            "📋",
          );
          logger.debug("Ticket details:", ticketSummary);
        } catch (error) {
          logger.error(`Error parsing YAML in ${fileName}`, error);
          logger.endGroup();
          continue;
        }

        const ticketData = ticket as Ticket;
        const issueTitle = ticketData.title;
        const issueBody = generateIssueBody(ticketData);
        const issueNumber = extractIssueNumber(fileName);

        logger.debug("Generated issue details:", {
          title: issueTitle,
          number: issueNumber || "New issue",
          bodyLength: issueBody.length,
        });

        if (dryRun) {
          logger.info("[DRY RUN] Would process ticket:", "🔄");
          logger.info(`  Title: ${issueTitle}`, "  📌");
          logger.info(`  Number: ${issueNumber || "New issue"}`, "  🔢");
          logger.info(`  Body length: ${issueBody.length} characters`, "  📝");
          logger.endGroup();
          continue;
        }

        if (issueNumber) {
          // Update existing issue
          await octokit.rest.issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            title: issueTitle,
            body: issueBody,
          });
          logger.info(`Updated issue #${issueNumber}: ${issueTitle}`);
        } else {
          // Create new issue
          const { data: issue } = await octokit.rest.issues.create({
            owner,
            repo,
            title: issueTitle,
            body: issueBody,
          });
          logger.info(`Created issue #${issue.number}: ${issueTitle}`);

          // Rename the file to include the new issue number
          if (issue.number) {
            const newFileName = `TICKET-${issue.number}-${fileName.split("-").slice(1).join("-")}`;
            const newFilePath = join(dirname(filePath), newFileName);
            await readFile(filePath).then((content) =>
              writeFile(newFilePath, content).then(() => unlink(filePath)),
            );
            logger.info(`Renamed ${fileName} to ${newFileName}`);
          }
        }
      } catch (error) {
        logger.error(`Error processing ${filePath}`, error);
      } finally {
        logger.endGroup();
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Action failed with error", error);
    core.setFailed(errorMessage);
  } finally {
    // Ensure all groups are closed
    while (core.isDebug()) {
      try {
        core.endGroup();
      } catch {
        break;
      }
    }
  }
}

function generateIssueBody(ticket: Ticket): string {
  let body = "";

  // Add description
  if (ticket.description) {
    body += `## Description\n${ticket.description}\n\n`;
  }

  // Add child tickets if this is a parent ticket
  if (ticket.child_tickets?.length) {
    body += "## Child Tickets\n";
    body += ticket.child_tickets
      .map((ticket) => `- ${ticket.id}: ${ticket.title}`)
      .join("\n");
    body += "\n\n";
  }

  // Add acceptance criteria
  if (ticket.acceptance_criteria?.length) {
    body += "## Acceptance Criteria\n";
    body += ticket.acceptance_criteria.map((item) => `- ${item}`).join("\n");
    body += "\n\n";
  }

  // Add technical details
  if (ticket.technical_details) {
    body += "## Technical Details\n";
    for (const [section, items] of Object.entries(ticket.technical_details)) {
      if (Array.isArray(items) && items.length > 0) {
        body += `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n`;
        body += items.map((item) => `- ${item}`).join("\n") + "\n\n";
      } else if (typeof items === "object" && items !== null) {
        body += `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n`;
        body += "```json\n" + JSON.stringify(items, null, 2) + "\n```\n\n";
      } else if (items) {
        body += `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n${items}\n\n`;
      }
    }
  }

  // Add sub-tasks
  if (ticket.sub_tasks?.length) {
    body += "## Sub-tasks\n";
    body += ticket.sub_tasks
      .map((task, index) => `${index + 1}. ${task}`)
      .join("\n");
    body += "\n\n";
  }

  // Add dependencies
  if (ticket.dependencies?.length) {
    body += "## Dependencies\n";
    body += ticket.dependencies.map((dep) => `- ${dep}`).join("\n");
    body += "\n\n";
  }

  // Add metadata
  const metadata = [];
  if (ticket.estimated_time)
    metadata.push(`**Estimated Time:** ${ticket.estimated_time}`);
  if (ticket.complexity) metadata.push(`**Complexity:** ${ticket.complexity}`);
  if (ticket.change_impact)
    metadata.push(`**Change Impact:** ${ticket.change_impact}`);

  if (metadata.length > 0) {
    body += "## Metadata\n" + metadata.join(" | ") + "\n\n";
  }

  return body.trim();
}

function convertLegacyFormat(legacyTicket: Record<string, unknown>): Ticket {
  const ticket: Partial<Ticket> = {};

  // Map legacy fields to new format
  if (typeof legacyTicket.Title === "string") ticket.title = legacyTicket.Title;
  if (typeof legacyTicket.Description === "string")
    ticket.description = legacyTicket.Description;

  // Handle acceptance criteria
  if (Array.isArray(legacyTicket["Acceptance Criteria"])) {
    ticket.acceptance_criteria = legacyTicket["Acceptance Criteria"].filter(
      (item: unknown): item is string => typeof item === "string",
    );
  } else if (typeof legacyTicket["Acceptance Criteria"] === "string") {
    ticket.acceptance_criteria = [legacyTicket["Acceptance Criteria"]];
  }

  // Handle technical details
  if (legacyTicket["Technical Details"]) {
    ticket.technical_details = {};
    if (
      typeof legacyTicket["Technical Details"] === "object" &&
      legacyTicket["Technical Details"] !== null
    ) {
      Object.assign(
        ticket.technical_details,
        legacyTicket["Technical Details"],
      );
    }
  }

  // Handle sub-tasks
  if (Array.isArray(legacyTicket["Sub-tasks"])) {
    ticket.sub_tasks = legacyTicket["Sub-tasks"].filter(
      (item: unknown): item is string => typeof item === "string",
    );
  }

  // Handle dependencies
  if (Array.isArray(legacyTicket.Dependencies)) {
    ticket.dependencies = legacyTicket.Dependencies.filter(
      (item: unknown): item is string => typeof item === "string",
    );
  } else if (typeof legacyTicket.Dependencies === "string") {
    ticket.dependencies = [legacyTicket.Dependencies];
  }

  // Copy other fields
  if (typeof legacyTicket["Estimated Time"] === "string")
    ticket.estimated_time = legacyTicket["Estimated Time"];
  if (typeof legacyTicket.Complexity === "string")
    ticket.complexity = legacyTicket.Complexity;
  if (typeof legacyTicket["Change Impact"] === "string")
    ticket.change_impact = legacyTicket["Change Impact"];

  return ticket as Ticket;
}

function extractIssueNumber(fileName: string): number | null {
  const match = fileName.match(/TICKET-(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

// Execute the action
run().catch((error) => {
  const logger = Logger.getInstance();
  logger.error("Action failed with error", error);
  core.setFailed(
    error instanceof Error ? error.message : "Unknown error occurred",
  );
  process.exit(1);
});
