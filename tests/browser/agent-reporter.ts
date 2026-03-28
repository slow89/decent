import fs from "node:fs/promises";
import path from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

interface AgentTestRecord {
  assertionFailures: string[];
  consoleErrors: Array<Record<string, unknown>>;
  flaky: boolean;
  networkErrors: Array<Record<string, unknown>>;
  retries: number;
  retry: number;
  route: string | null;
  scenario: string | null;
  screenshotPaths: string[];
  status: string;
  testId: string;
  title: string;
  tracePath: string | null;
  viewport: string;
}

export default class AgentReporter implements Reporter {
  private config: FullConfig | null = null;
  private rootSuite: Suite | null = null;

  async onEnd(result: FullResult) {
    if (!this.config) {
      return;
    }

    const records: AgentTestRecord[] = [];

    for (const test of flattenTests(this.rootSuite)) {
      const latestResult = test.results.at(-1);

      if (!latestResult) {
        continue;
      }

      const consoleErrors = await readAttachmentJsonArray(latestResult, "console-errors");
      const networkErrors = await readAttachmentJsonArray(latestResult, "network-errors");
      const screenshotPaths = latestResult.attachments
        .filter((attachment) => attachment.name === "final-screenshot" && attachment.path)
        .map((attachment) => attachment.path as string);
      const tracePath =
        latestResult.attachments.find((attachment) => attachment.name === "trace")?.path ?? null;

      records.push({
        assertionFailures: getAssertionFailures(latestResult),
        consoleErrors,
        flaky: test.outcome() === "flaky",
        networkErrors,
        retries: test.retries,
        retry: latestResult.retry,
        route: getAnnotationValue(test, "route"),
        scenario: getAnnotationValue(test, "scenario"),
        screenshotPaths,
        status: latestResult.status,
        testId: test.id,
        title: test.titlePath().join(" > "),
        tracePath,
        viewport: test.parent.project()?.name ?? "unknown",
      });
    }

    const reportPath = path.resolve(
      process.cwd(),
      "output/testing/latest.json",
    );
    await fs.mkdir(path.dirname(reportPath), {
      recursive: true,
    });
    await fs.writeFile(
      reportPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          mode: process.env.PLAYWRIGHT_AGENT_MODE ? "agent" : "standard",
          overallStatus: result.status,
          tests: records,
        },
        null,
        2,
      )}\n`,
    );
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.rootSuite = suite;
  }
}

function flattenTests(suite: Suite | null): TestCase[] {
  if (!suite) {
    return [];
  }

  const tests: TestCase[] = [];

  for (const childSuite of suite.suites) {
    tests.push(...flattenTests(childSuite));
  }

  tests.push(...suite.tests);

  return tests;
}

function getAnnotationValue(test: TestCase, annotationType: string) {
  return test.annotations.find((annotation) => annotation.type === annotationType)?.description ?? null;
}

function getAssertionFailures(result: TestResult) {
  return result.errors.map((error) => error.message ?? String(error.value ?? "Unknown error"));
}

async function readAttachmentJsonArray(
  result: TestResult,
  attachmentName: string,
) {
  const attachment = result.attachments.find(
    (entry) => entry.name === attachmentName && entry.path,
  );

  if (!attachment?.path) {
    return [];
  }

  try {
    const content = await fs.readFile(attachment.path, "utf8");
    const parsed = JSON.parse(content) as unknown;

    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
