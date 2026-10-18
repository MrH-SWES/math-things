// Safe first deployment: public math tools only.
// Teaching Table stays unavailable until Cloudflare Access and the book gateway
// are configured and tested on the dedicated app Worker.
const BASE='/apps/teaching-table';
export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname===BASE || url.pathname.startsWith(BASE+'/')) {
      return new Response('Teaching Table setup in progress', {
        status: 503,
        headers: {
          'Content-Type':'text/plain; charset=utf-8',
          'Cache-Control':'private, no-store',
          'X-Content-Type-Options':'nosniff'
        }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
