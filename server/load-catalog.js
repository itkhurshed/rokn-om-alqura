/* Loads the storefront's catalogue files (config, products, catalog) in a sandbox so the
   server seeds from exactly the same data the website shows. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function loadCatalog(root) {
  const ctx = { window: {}, console };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  ['assets/js/config.js', 'assets/js/data/products.js', 'assets/js/data/catalog.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
  const R = ctx.ROKN;
  return { products: R.data.products, catalog: { colors: R.catalog.colors, categories: R.catalog.categories, collections: R.catalog.collections, fabricTypes: R.catalog.fabricTypes }, config: R.config };
};
