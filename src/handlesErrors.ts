// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {hasSnippets} from './utils';
import * as eslint from 'eslint';
import {Statement} from 'estree';

const block = `process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
`;

export const noErrorHandlingMessageId = 'no-error-handling';
export const noErrorHandlingMessage = `Sample must capture unhandled errors. Please add the following block *before* your call to 'main':\n\n ${block}\n`;

export const handlesErrors: eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ensure there is a global error handler',
    },
    fixable: 'code',
    messages: {
      [noErrorHandlingMessageId]: noErrorHandlingMessage,
    },
  },
  create: function (context) {
    return {
      Program(node) {
        if (!hasSnippets(node)) {
          return;
        }
        const source = context.getSourceCode().text.trim();
        const hasBlock = source.includes(block);

        // only attempt to fix this if the final node in the file is
        // a call to `main()`.
        let canFix = false;
        let mainNode: Statement;
        if (node.body.length) {
          mainNode = node.body[node.body.length - 1] as Statement;
          if (
            mainNode &&
            mainNode.type === 'ExpressionStatement' &&
            mainNode.expression.type === 'CallExpression' &&
            mainNode.expression.callee.type === 'Identifier' &&
            mainNode.expression.callee.name === 'main'
          ) {
            canFix = true;
          }
        }

        if (!hasBlock) {
          if (canFix) {
            context.report({
              node,
              messageId: noErrorHandlingMessageId,
              fix: fixer => fixer.insertTextBefore(mainNode, block),
            });
          } else {
            context.report({
              node,
              messageId: noErrorHandlingMessageId,
            });
          }
        }
      },
    };
  },
};
