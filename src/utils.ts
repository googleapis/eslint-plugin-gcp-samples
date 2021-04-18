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

import * as estree from 'estree';

export function hasSnippets(node: estree.Program) {
  const commentLines = (node.comments || []).filter(x => x.type === 'Line');
  const startTags = commentLines.filter(x => /\[START /.test(x.value));
  const endTags = commentLines.filter(x => /\[END /.test(x.value));
  return startTags.length > 0 && endTags.length > 0;
}
