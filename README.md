# Jibin Varghese & Sofia John — Wedding Microsite

A cinematic, scroll-told wedding invitation. Static HTML, CSS and vanilla JavaScript, with no build step, no framework, no backend. It runs on GitHub Pages for free.

```
index.html              page structure (+ link-preview tags)
config.js               ← ALL wedding details live here
assets/
  css/styles.css        design system: colour, type, spacing and motion tokens at the top
  js/main.js            content binding, scroll engine, countdown, lightbox, music
  js/rsvp.js            RSVP validation + swappable delivery providers (isolated)
  images/
    scenes/             painted scenes (WebP): church, nave, dusk, stained glass, textures
    og-image.jpg        WhatsApp / social preview (1200×630)
  icons/favicon.svg
  music/                put wedding.mp3 here
  fonts/                self-hosted Cormorant Garamond + Jost (SIL OFL)
```

---

## 1. Editing wedding details

Open **`config.js`**. It holds the names, dates, times, venues, addresses, map links, the Bible verse, story text, timeline, photo paths, RSVP settings and music.

- If you don't know a value yet, leave it as `""`. The site then shows a quiet line such as *"Church to be announced"* or *"Time to follow"*. It never makes up details.
- Times use 24-hour Kerala time: `"11:00"`, `"16:30"`.
- `wedding.ceremonyTime` also sets the countdown target. Until you set it, the countdown runs to 00:00 IST on 25 April 2027.

**Values still to fill in:** engagement time, venue and address. Wedding church name, address and time. Reception venue, address and time. All Google Maps URLs (they currently search for the town name). Timeline times. RSVP provider and deadline.

**The one exception is the link preview.** WhatsApp and iMessage read the `<meta property="og:…">` tags at the top of `index.html` without running JavaScript, so edit those by hand. After deploying, change `og:image` to the full URL, for example `https://YOUR-USERNAME.github.io/YOUR-REPO/assets/images/og-image.jpg`. Otherwise many apps won't show the image.

## 2. The painted scenes

The scenes are oil-painting-style images in `assets/images/scenes/`:
- the church at dawn, which the camera flies into
- the nave where the invitation appears
- the church at dusk for the closing
- a stained-glass window
- two canvas textures

Phones get the portrait versions; tablets in landscape and desktops get the landscape ones.

To use your own artwork (for example AI-generated paintings), set the paths in `config.js → scenes` and keep the same proportions. In the church paintings, the camera zooms into the **church door**. The door must sit horizontally centred, at **84.8 %** from the top in the portrait version and **81.65 %** in the landscape version. Otherwise, change `--door` in `styles.css`.

## 3. Music

Put an MP3 at `assets/music/wedding.mp3`. The music button appears only once that file exists. Music never autoplays: mobile browsers block it, and it's impolite. Guests tap **Music** to start it. Set `music.enabled: false` to remove the button. Only use music you have the right to share.

## 4. Connecting RSVP (all free tiers)

Right now `rsvp.provider` is `"demo"`. Replies are validated and acknowledged, but they **are only stored in the guest's own browser, so you will not receive them.** Pick a provider before you send the link:

**Formspree (easiest).** Sign up at formspree.io, create a form, and copy its endpoint.
```js
provider: "formspree", endpoint: "https://formspree.io/f/abcdwxyz",
```

**Google Sheets via Apps Script (free, replies land in a spreadsheet).**
1. Create a Google Sheet with headers in row 1: `submittedAt | name | attending | guests | message`.
2. Go to Extensions → Apps Script and paste:
   ```js
   function doPost(e) {
     var d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet().appendRow([d.submittedAt, d.name, d.attending, d.guests, d.message]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. Deploy → New deployment → Web app. Set *Execute as: Me* and *Who has access: Anyone*. Copy the URL.
4. In `config.js`: `provider: "appsScript", endpoint: "https://script.google.com/macros/s/…/exec"`.

**Google Forms.** Use `provider: "googleForm"`. The endpoint is the form URL ending in `/formResponse`, and you fill `googleFormFields` with the `entry.NNNN` IDs (find them via the form's "Get pre-filled link"). The browser can't confirm delivery with this method, so test once yourself.

**Supabase / Firebase.** Supported in `assets/js/rsvp.js`. Set `endpoint` (and `key` for Supabase's anon key). Lock the table down with insert-only row-level security.

Every provider is a small function in `assets/js/rsvp.js`. To add a new one, write a function that returns a Promise and reference it by name.

## 5. Deploying to GitHub Pages

1. Push this repository to GitHub. The site files must be at the root of the branch, as they are here.
2. On GitHub, open the repo and go to **Settings → Pages**.
3. Under **Build and deployment**, set *Source* to **Deploy from a branch**, the branch to **`main`** (or whichever branch holds the site), and the folder to **`/ (root)`**. Click **Save**.
4. Wait about 1 minute. The site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
5. Update `og:image` in `index.html` to that absolute URL (see section 1), commit, and push. Pages redeploys automatically on every push.
6. Test the link by sending it to yourself on WhatsApp. If the preview is stale, add `?v=2` to the URL.

The empty `.nojekyll` file tells Pages to serve files as they are. All paths are relative, so the site works under any repo name. A custom domain can be added later under Settings → Pages → Custom domain.

**Preview locally:** run `python3 -m http.server` in this folder and open http://localhost:8000. Opening `index.html` straight from disk mostly works, but a local server is more faithful.

**Before sending the link,** make sure you have:
- filled in `config.js`
- connected RSVP
- set the absolute `og:image` URL
- tested the site on one Android phone and one iPhone

---

## Design notes

**What was taken from the reference video.** These are interaction ideas only. None of its art, text or branding is used.
- **Opening.** Large tracked capitals for the names float over a sky. On scroll, a monument rises from below, the names recede behind it, and the camera pushes *through* the architecture into the next scene.
- **Architecture as portal.** Every major scene change happens through an arch. The arch frames the invitation copy, and section edges open like doorways.
- **Pacing.** Each scene holds briefly while pinned, then hands over. Long stretches have no motion until the guest scrolls. Scroll position drives most of the motion.
- **Information sections.** Events sit in framed cards with a photograph, title, details and a location button. The countdown uses small tiles on a textured ivory paper. Then comes "Will you join us?" with an RSVP call to action.
- **Closing.** A wide landscape scene is the final, still image.

**The original visual system made for Jibin & Sofi:**
- **Palette.** Ivory with a muted gold, borrowed from the *kasavu* saree (off-white with a gold border), and deep forest green. Gold is only for hairlines and large type. Small gold text uses a darker shade so it stays readable.
- **Type.** Cormorant Garamond for display and body, with italic instead of a script font for an editorial rather than template feel. Jost in small spaced capitals for labels.
- **Motifs.** A line-drawn Kerala church façade, coconut palms, jasmine (*mulla*) sprigs, a rose window, and rounded church-window arches on every photo frame. The cross is a small *budded* cross, a quiet nod to the St Thomas Christian tradition. It appears only a handful of times, always small.
- **Story arc.** You walk toward a church at dawn, step through its lit doorway into the nave where the invitation waits, and leave at dusk by the backwaters with the church glowing.

**Performance and accessibility.**
- All scroll motion is `transform` and `opacity`, driven by one `requestAnimationFrame` loop. That loop only measures sections currently near the viewport.
- The countdown only ticks while it is on screen.
- Fonts are self-hosted and Latin-subset (about 176 KB total, with the two critical files preloaded). Images lazy-load. There are no libraries.
- `prefers-reduced-motion` collapses the pinned scenes into calm static compositions and removes transitions.
- The lightbox supports Esc, arrow keys, swipe and a focus trap. Form errors are announced with `aria-live`.
