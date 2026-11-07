/**
 * Math Things / Google Sites proof of concept.
 * No student data. No external app hosting.
 * All activities are bundled as Apps Script HTML project files.
 */
const MATH_THINGS_APPS = [
  { slug: 'array-architect', title: 'Array Architect', topic: 'Multiplication', detail: 'Build arrays and explore rows, columns, and products.', icon: 'array', htmlFile: 'App_ArrayArchitect' },
  { slug: 'ten-frame', title: 'Ten Frame', topic: 'Number Sense', detail: 'Make and break numbers using a hands-on ten frame.', icon: 'ten', htmlFile: 'App_TenFrame' }
];
const APP_LOOKUP = Object.fromEntries(MATH_THINGS_APPS.map(app => [app.slug, app]));

function doGet(e) {
  const slug = String(e && e.parameter && e.parameter.app || '').trim().toLowerCase();
  if (slug && !APP_LOOKUP[slug]) {
    return HtmlService.createHtmlOutput('<!doctype html><html><body style="font:20px system-ui;padding:2rem"><h1>App not found</h1><p>Return to the Math Things launcher.</p></body></html>')
      .setTitle('App not found');
  }
  const app = slug ? APP_LOOKUP[slug] : null;
  const output = HtmlService.createHtmlOutputFromFile(app ? app.htmlFile : 'Home')
    .setTitle(app ? app.title + ' | Math Things' : 'Math Things | Explore Mathematics');
  // Only public, anonymous classroom manipulatives may be embedded.
  return output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getCatalog() {
  return {
    url: ScriptApp.getService().getUrl() || '',
    apps: MATH_THINGS_APPS.map(app => ({
      slug: app.slug,
      title: app.title,
      topic: app.topic,
      detail: app.detail,
      icon: app.icon
    }))
  };
}
