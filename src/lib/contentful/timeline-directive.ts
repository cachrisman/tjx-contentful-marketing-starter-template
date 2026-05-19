import {
  Kind,
  type DirectiveNode,
  type DocumentNode,
  type ObjectFieldNode,
  type OperationDefinitionNode,
} from 'graphql';

import type { TimelineContext } from '@/lib/contentful/timeline-shared';
import { hasTimelineContext } from '@/lib/contentful/timeline-shared';

function timelineWhereFields(ctx: TimelineContext): ObjectFieldNode[] {
  const fields: ObjectFieldNode[] = [];
  if (ctx.release) {
    fields.push({
      kind: Kind.OBJECT_FIELD,
      name: { kind: Kind.NAME, value: 'release_lte' },
      value: { kind: Kind.STRING, value: ctx.release },
    });
  }
  if (ctx.timestamp) {
    fields.push({
      kind: Kind.OBJECT_FIELD,
      name: { kind: Kind.NAME, value: 'timestamp_lte' },
      value: { kind: Kind.STRING, value: ctx.timestamp },
    });
  }
  return fields;
}

function buildTimelineDirective(ctx: TimelineContext): DirectiveNode {
  return {
    kind: Kind.DIRECTIVE,
    name: { kind: Kind.NAME, value: 'timeline' },
    arguments: [
      {
        kind: Kind.ARGUMENT,
        name: { kind: Kind.NAME, value: 'where' },
        value: {
          kind: Kind.OBJECT,
          fields: timelineWhereFields(ctx),
        },
      },
    ],
  };
}

/**
 * Injects `@timeline(where: { … })` on the sole operation. Idempotent; never mutates input.
 */
export function injectTimelineDirective(
  document: DocumentNode,
  ctx: TimelineContext,
): DocumentNode {
  if (!hasTimelineContext(ctx)) {
    return document;
  }

  const operations = document.definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === Kind.OPERATION_DEFINITION,
  );

  if (operations.length > 1) {
    throw new Error(
      'injectTimelineDirective: document has multiple operations; Timeline injection supports one operation per query file',
    );
  }

  if (operations.length === 0) {
    return document;
  }

  const operation = operations[0];
  if (operation.directives?.some(d => d.name.value === 'timeline')) {
    return document;
  }

  const operationIndex = document.definitions.indexOf(operation);
  if (operationIndex === -1) {
    return document;
  }

  const directive = buildTimelineDirective(ctx);
  const nextOperation: OperationDefinitionNode = {
    ...operation,
    directives: [...(operation.directives ?? []), directive],
  };

  const definitions = [...document.definitions];
  definitions[operationIndex] = nextOperation;

  return {
    ...document,
    definitions,
  };
}
