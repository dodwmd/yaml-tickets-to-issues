export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "body-max-line-length": [
      1,
      "always",
      1000, // Allow longer lines in commit body for release commits
    ],
  },
  ignores: [
    (commit) => commit.startsWith("chore(release):"), // Skip validation for release commits
  ],
};
