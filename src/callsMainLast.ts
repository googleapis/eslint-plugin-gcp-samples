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

const block = 'main(...process.argv.slice(2));';

export const noCallMainMessageId = 'no-main-call';
export const noCallMainErrorMessage =
  'Sample must call the `main` method as the last statement in the file.';

export const mainPassesNoArgsMessageId = 'no-args-main-call';
export const mainPassesNoArgsMessage =
  'The `main` method must pass `...process.argv.slice(2) as arguments.';

export const callsMainLast: eslint.Rule.RuleModule = {
  meta: {
    messages: {
      [noCallMainMessageId]: noCallMainErrorMessage,
      [mainPassesNoArgsMessageId]: mainPassesNoArgsMessage,
    },
    type: 'problem',
    fixable: 'code',
    docs: {
      description: `ensure "${block}" is the last part of the sample.`,
    },
  },
  create: function (context) {
    return {
      Program(node) {
        if (!hasSnippets(node)) {
          return;
        }
        const source = context.getSourceCode().text.trim();
        if (source.endsWith('main();')) {
          // only attemp to to autofix `main()` to
          // `main(...process.arv.slice(2))` - otherwise it's unclear what
          // the user was trying to do
          const mainNode = node.body[node.body.length - 1];
          context.report({
            node: mainNode,
            messageId: mainPassesNoArgsMessageId,
            fix: fixer => fixer.replaceText(mainNode, block),
          });
        } else if (!source.endsWith(block)) {
          context.report({
            node,
            messageId: noCallMainMessageId,
          });
        }
      },
    };
  },
};
