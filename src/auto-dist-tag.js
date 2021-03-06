'use strict';

const fs = require('fs-extra');
const pkgUp = require('pkg-up');
const getDistTags = require('./fetch-dist-tags');
const calcDistTag = require('./calc-dist-tag');

module.exports = function autoDistTag(cwd, options) {
  let pkgPath, pkg, tags, tag;

  return pkgUp(cwd)
    .then(_pkgPath => (pkgPath = _pkgPath))
    .then(() => fs.readJson(pkgPath))
    .then(_pkg => (pkg = _pkg))
    .then(() => getDistTags(pkg.name))
    .then(_tags => (tags = _tags))
    .then(() => calcDistTag(pkg.version, tags))
    .then(_tag => (tag = _tag))
    .then(() => {
      if (options && options.write) {
        // skip writing to `package.json if an explicit publishConfig.tag is set
        if ('publishConfig' in pkg && 'tag' in pkg.publishConfig) {
          return;
        }

        // skip writing to `package.json if the calculated tag is "latest" because it's the default anyway
        if (tag === 'latest') {
          return;
        }

        pkg.publishConfig = pkg.publishConfig || {};
        pkg.publishConfig.tag = tag;

        return fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }
    })
    .then(() => tag);
};
