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

import {describe, it} from 'mocha';
import {RuleTester} from 'eslint';
import {
  callsMainLast,
  mainPassesNoArgsMessageId,
  noCallMainMessageId,
} from '../src/callsMainLast';
import {hasMain, noMainMessageId} from '../src/hasMain';
import {handlesErrors, noErrorHandlingMessageId} from '../src/handlesErrors';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
  },
});

describe('gcp samples', () => {
  it('should error for missing main method', () => {
    ruleTester.run('gcp-samples/has-main', hasMain, {
      valid: [
        {
          code: `async function main() {
            // [START product_snippet]
            // [END product_snippet]
          }`,
        },
        {
          code: "console.log('no region tags');",
        },
      ],
      invalid: [
        {
          code: `
            // [START product_snippet]
            console.log('no main function!');
            // [END product_snippet]`,
          errors: [{messageId: noMainMessageId}],
        },
      ],
    });
  });

  it('should check for calling `main` at the very end', () => {
    ruleTester.run('gcp-samples/calls-main-last', callsMainLast, {
      valid: [
        {
          code: `async function main() {
  // [START product_snippet]
  // [END product_snippet]
}
main(...process.argv.slice(2));
`,
        },
        {
          code: "console.log('no region tags');",
        },
      ],
      invalid: [
        {
          code: `
            // [START product_snippet]
            console.log('no main function!');
            // [END product_snippet]`,
          errors: [{messageId: noCallMainMessageId}],
        },
        {
          code: `// [START product_snippet]
// [END product_snippet]
main();`,
          errors: [{messageId: mainPassesNoArgsMessageId}],
          output: `// [START product_snippet]
// [END product_snippet]
main(...process.argv.slice(2));`,
        },
      ],
    });
  });

  it('should make sure error handling is in place', () => {
    ruleTester.run('gcp-samples/handles-errors', handlesErrors, {
      valid: [
        {
          code: `
            process.on('unhandledRejection', err => {
              console.error(err.message);
              process.exitCode = 1;
            });
            main(...process.argv.slice(2));
          `,
        },
        {
          code: "console.log('no region tags');",
        },
      ],
      invalid: [
        {
          code: `// [START product_snippet]
// [END product_snippet]
main(...process.argv.slice(2));
`,
          errors: [{messageId: noErrorHandlingMessageId}],
          output: `// [START product_snippet]
// [END product_snippet]
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
`,
        },
      ],
    });
  });
});
