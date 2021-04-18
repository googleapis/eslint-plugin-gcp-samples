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
import * as estree from 'estree';

export const noMainMessageId = 'no-main';
export const errorMessage =
  'The sample must have exactly one top level `main` method.';

export const hasMain: eslint.Rule.RuleModule = {
  meta: {
    messages: {
      [noMainMessageId]: errorMessage,
    },
    type: 'problem',
    docs: {
      description: 'ensure there is a `main` function that contains the sample',
    },
  },
  create: function (context) {
    return {
      Program(node) {
        if (!hasSnippets(node)) {
          return;
        }
        const fns = node.body
          .filter(x => x.type === 'FunctionDeclaration')
          .filter(x => (x as estree.FunctionDeclaration).id?.name === 'main');
        if (fns.length !== 1) {
          context.report({
            node,
            messageId: noMainMessageId,
          });
        }
      },
    };
  },
};
