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
import {execSync} from 'child_process';
import * as assert from 'assert';

const cmd =
  '"./node_modules/.bin/eslint" --config "test/fixtures/.eslintrc" --no-ignore --no-eslintrc "test/fixtures"';

describe('gcp samples', () => {
  it('should pass for a perfect snippet', () => {
    execSync(`${cmd}/correct.js`);
  });

  it('should error for missing main method', () => {
    assert.throws(
      () => execSync(`${cmd}/no-main.js`, {encoding: 'utf-8'}),
      err => {
        return /The sample must have exactly one top level/.test(err.stdout);
      }
    );
  });

  it('should ignore files with no snippets', () => {
    execSync(`${cmd}/no-sample.js`);
  });

  it('should check for calling `main` at the very end', () => {
    assert.throws(
      () => execSync(`${cmd}/dont-call-main.js`, {encoding: 'utf-8'}),
      err => {
        return /Sample must call the/.test(err.stdout);
      }
    );
  });

  it('should make sure command args are passed to main', () => {
    assert.throws(
      () => execSync(`${cmd}/call-main-no-params.js`, {encoding: 'utf-8'}),
      err => {
        return /method must pass/.test(err.stdout);
      }
    );
  });

  it('should make sure error handling is in place', () => {
    assert.throws(
      () => execSync(`${cmd}/no-error-handling.js`, {encoding: 'utf-8'}),
      err => {
        return /capture unhandled/.test(err.stdout);
      }
    );
  });
});
