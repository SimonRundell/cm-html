/**
 * @fileoverview Structured teaching content for the HTML/CSS learning drawer.
 * Each chapter contains an intro, sections (with optional code and tables), and key points.
 * Chapters follow the pedagogical progression from the Unlock the Cinema scheme of work.
 */

export const CHAPTERS = [
  // ─────────────────────────────────────────────────────────────
  // CHAPTER 1 — HTML BASICS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'html-basics',
    title: 'HTML Basics',
    badge: 'HTML',
    color: '#ef6c00',
    intro:
      'HTML (HyperText Markup Language) is the skeleton of every web page. It describes the content and structure — headings, paragraphs, images, links — and the browser turns it into something you can see and interact with.',
    sections: [
      {
        title: 'The Basic Document Structure',
        content:
          'Every HTML file starts with the same boilerplate. The browser reads this to know it\'s a valid HTML5 document. The <head> holds invisible meta-information; the <body> holds everything the visitor actually sees.',
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page Title</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
  </body>
</html>`,
      },
      {
        title: 'Tags, Elements, and Attributes',
        content:
          'A tag is code inside angle brackets, like <p>. An element is the opening tag + its content + the closing tag. Attributes go inside the opening tag and add extra information — like an id, a class, or a link destination.',
        code: `<!-- Element: opening tag + content + closing tag -->
<h1 class="page-title">Welcome to my site</h1>
<!--  ^^^^^^^^^^^^^^^^^^^^ attribute: name="value" -->

<!-- Some tags are self-closing — they have no content -->
<img src="logo.png" alt="Site logo">
<br>
<hr>`,
      },
      {
        title: 'Essential Text Tags',
        content:
          'These tags are the ones you will use on almost every page. Headings create hierarchy — use only one <h1> per page.',
        table: {
          headers: ['Tag', 'Purpose'],
          rows: [
            ['<h1> — <h6>', 'Headings. h1 = most important; h6 = least important'],
            ['<p>', 'A paragraph of text'],
            ['<strong>', 'Bold / important text (has meaning for screen readers)'],
            ['<em>', 'Italic / emphasised text (has meaning for screen readers)'],
            ['<br>', 'A line break (self-closing)'],
            ['<hr>', 'A horizontal divider line (self-closing)'],
            ['<!-- text -->', 'A comment — ignored by the browser, useful for notes'],
          ],
        },
      },
      {
        title: 'Lists',
        content:
          'HTML has two list types. An unordered list (<ul>) shows bullet points. An ordered list (<ol>) shows numbers. Each item in either list uses <li>.',
        code: `<!-- Unordered list (bullets) -->
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<!-- Ordered list (numbers) -->
<ol>
  <li>Plan your page</li>
  <li>Write the HTML</li>
  <li>Add CSS styling</li>
</ol>`,
      },
      {
        title: 'Nesting Rules',
        content:
          'Elements can be placed inside other elements — this is called nesting. The rule is: always close inner tags before outer tags. Think of it like brackets: the last one opened is the first one closed.',
        code: `<!-- CORRECT: inner tag closed before outer tag -->
<p>This text has <strong>bold words</strong> in it.</p>

<!-- WRONG: overlapping tags — browser will try to fix this
     but results are unpredictable -->
<p>This is <strong>wrong</p></strong>`,
        tips: [
          'Use indentation (2 or 4 spaces) to make nesting visible at a glance.',
        ],
      },
    ],
    keyPoints: [
      'HTML describes structure and meaning, not appearance — that\'s CSS\'s job',
      'Always start with <!DOCTYPE html> followed by the <html>, <head>, and <body> structure',
      'Attributes sit inside the opening tag and follow the pattern name="value"',
      'Tags must be nested correctly — close the innermost tag first',
      'Use only one <h1> per page; use headings in order (h1 → h2 → h3)',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 2 — SEMANTIC HTML
  // ─────────────────────────────────────────────────────────────
  {
    id: 'semantic-html',
    title: 'Semantic HTML',
    badge: 'HTML',
    color: '#ef6c00',
    intro:
      'Semantic HTML means using tags that describe the purpose of the content, not just how it looks. A <header> tells the browser (and screen readers, and search engines) "this is the top section". A <div> tells the browser nothing — it\'s just a box.',
    sections: [
      {
        title: 'Why Semantics Matter',
        content:
          'Using the right tags improves three things: Accessibility (screen readers can navigate your page sensibly), SEO (search engines understand your content better), and Maintainability (other developers can read your code more easily).',
        code: `<!-- Non-semantic: what does any of this mean? -->
<div class="top-bit">
  <div class="logo-thing">My Site</div>
  <div class="link-row">...</div>
</div>

<!-- Semantic: immediately clear to everyone -->
<header>
  <h1>My Site</h1>
  <nav>...</nav>
</header>`,
      },
      {
        title: 'Page Structure Tags',
        content:
          'These seven tags form the skeleton of a well-structured page. Most pages will use all of them.',
        table: {
          headers: ['Tag', 'Used for'],
          rows: [
            ['<header>', 'The top section of the page or a section — usually contains the logo and site title'],
            ['<nav>', 'A block of navigation links'],
            ['<main>', 'The primary content of the page — only one per page'],
            ['<section>', 'A themed grouping of content with its own heading'],
            ['<article>', 'A self-contained piece of content (a blog post, a film card, a news story)'],
            ['<aside>', 'Side content loosely related to the main content (sidebar, pull-quote)'],
            ['<footer>', 'The bottom section — copyright, contact links, credits'],
          ],
        },
      },
      {
        title: 'A Full Semantic Page Structure',
        content:
          'Here is how a typical page fits together using semantic elements:',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Film Reviews</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header>
    <h1>Film Reviews</h1>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="reviews.html">Reviews</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section>
      <h2>Latest Reviews</h2>

      <article>
        <h3>Dune: Part Two</h3>
        <p>A stunning visual achievement...</p>
      </article>

      <article>
        <h3>Oppenheimer</h3>
        <p>A gripping historical thriller...</p>
      </article>
    </section>

    <aside>
      <h3>Coming Soon</h3>
      <p>Check back for more reviews.</p>
    </aside>
  </main>

  <footer>
    <p>&copy; 2025 Film Reviews</p>
  </footer>

</body>
</html>`,
      },
      {
        title: 'Other Useful Semantic Tags',
        content:
          'Beyond page structure, HTML has many other semantic tags for specific types of content.',
        table: {
          headers: ['Tag', 'Used for'],
          rows: [
            ['<figure>', 'Self-contained media (image, diagram, code block)'],
            ['<figcaption>', 'A caption for a <figure>'],
            ['<time datetime="">', 'A date or time — machine-readable with the datetime attribute'],
            ['<address>', 'Contact information for the nearest article or body'],
            ['<mark>', 'Highlighted or relevant text'],
            ['<abbr title="">', 'An abbreviation — shows the full text on hover'],
            ['<blockquote>', 'A long quotation from another source'],
            ['<cite>', 'The title of a creative work'],
          ],
        },
      },
    ],
    keyPoints: [
      'Use <div> only when no semantic tag fits — it carries no meaning',
      'Semantic tags help screen readers navigate your page for users with disabilities',
      'Search engines weight content inside semantic tags more heavily',
      'One <main> per page — it marks your primary content',
      '<article> = standalone content; <section> = thematic grouping (sections need articles more than the reverse)',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 3 — LINKS & NAVIGATION
  // ─────────────────────────────────────────────────────────────
  {
    id: 'links-navigation',
    title: 'Links & Navigation',
    badge: 'HTML',
    color: '#ef6c00',
    intro:
      'Links are what makes the web a web. The <a> (anchor) tag connects pages together. Understanding relative vs absolute paths is essential once your site has more than one page.',
    sections: [
      {
        title: 'The Anchor Tag',
        content:
          'The <a> tag creates a clickable link. The href attribute tells the browser where to go. The text between the tags is what the user sees and clicks.',
        code: `<!-- Link to an external site -->
<a href="https://www.bbc.co.uk">Visit the BBC</a>

<!-- Link to another page in your project -->
<a href="about.html">About Us</a>

<!-- Link to a section on the same page -->
<a href="#contact">Jump to Contact</a>

<!-- The destination section needs a matching id -->
<section id="contact">
  <h2>Contact Us</h2>
</section>`,
      },
      {
        title: 'Relative vs Absolute Paths',
        content:
          'An absolute path is a complete URL — it works from anywhere. A relative path is relative to where the current file lives — it changes depending on your folder structure.',
        code: `<!-- Absolute path — works anywhere -->
<a href="https://example.com/about.html">About</a>

<!-- Relative path — same folder as index.html -->
<a href="about.html">About</a>

<!-- Relative path — file is in a subfolder -->
<a href="pages/about.html">About</a>

<!-- Relative path — file is one folder up -->
<a href="../index.html">Home</a>`,
        tips: [
          'Use relative paths within your own project — if you rename the folder, fewer links break.',
        ],
      },
      {
        title: 'Recommended Folder Structure',
        content:
          'Organising your files into folders from the start saves a lot of headaches later.',
        code: `my-website/
├── index.html          ← home page (must be named index.html)
├── now-showing.html
├── contact.html
├── css/
│   └── style.css
├── images/
│   ├── banner.jpg
│   └── film-poster.jpg
└── js/
    └── script.js`,
      },
      {
        title: 'Navigation Menus',
        content:
          'A navigation menu is a <nav> element containing an unordered list of links. CSS is used later to make it look like a horizontal bar.',
        code: `<nav>
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="now-showing.html">Now Showing</a></li>
    <li><a href="coming-soon.html">Coming Soon</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>`,
      },
      {
        title: 'Link Attributes',
        content:
          'The <a> tag has several useful attributes beyond href.',
        table: {
          headers: ['Attribute', 'Effect'],
          rows: [
            ['href="https://..."', 'Where the link goes (required)'],
            ['target="_blank"', 'Opens in a new tab'],
            ['rel="noopener noreferrer"', 'Security best practice when using target="_blank"'],
            ['title="..."', 'Tooltip text shown on hover'],
            ['href="mailto:you@email.com"', 'Opens the user\'s email app'],
            ['href="tel:+441234567890"', 'Calls the number on mobile devices'],
            ['href="#section-id"', 'Scrolls to an element with that id on the same page'],
          ],
        },
      },
    ],
    keyPoints: [
      'The href attribute is what makes an anchor tag a link',
      'Use relative paths for pages within your own project',
      'Always use rel="noopener noreferrer" with target="_blank" for security',
      'The page id and the href anchor (#id) must match exactly — case sensitive',
      'Name your home page index.html — web servers look for this file by default',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 4 — IMAGES & MEDIA
  // ─────────────────────────────────────────────────────────────
  {
    id: 'images-media',
    title: 'Images & Media',
    badge: 'HTML',
    color: '#ef6c00',
    intro:
      'Images, video, and embedded content bring a page to life. HTML provides dedicated tags for each media type, and understanding the alt attribute is especially important for accessibility.',
    sections: [
      {
        title: 'The img Tag',
        content:
          'The <img> tag is self-closing. Its two required attributes are src (where the image file is) and alt (a text description of the image).',
        code: `<!-- Basic image -->
<img src="images/banner.jpg" alt="A wide shot of a cinema foyer">

<!-- With explicit dimensions (good practice) -->
<img src="images/poster.jpg" alt="Film poster for Dune" width="300" height="450">

<!-- Image in a subfolder, from a file in the project root -->
<img src="images/logo.png" alt="Cinema logo">`,
      },
      {
        title: 'Writing Good Alt Text',
        content:
          'The alt attribute is read aloud by screen readers for users who cannot see the image. A missing or unhelpful alt attribute is one of the most common accessibility failures.',
        table: {
          headers: ['Situation', 'What to write'],
          rows: [
            ['Meaningful image', 'Describe what it shows: "Three friends laughing at a cinema"'],
            ['Decorative image (purely visual)', 'Empty string: alt="" — screen readers skip it'],
            ['Image of text', 'Write out the text: alt="Now Showing — Summer 2025"'],
            ['Logo', 'Company name: alt="Cineworld logo"'],
            ['Button image', 'The button\'s action: alt="Play trailer"'],
          ],
        },
        tips: [
          'Never write alt="image" or alt="photo" — that\'s meaningless. Describe what\'s actually there.',
        ],
      },
      {
        title: 'figure and figcaption',
        content:
          'Wrap an image (or other media) in a <figure> element when it has a visible caption. This creates a semantic relationship between the image and its label.',
        code: `<figure>
  <img src="images/director.jpg" alt="Director Christopher Nolan on set">
  <figcaption>Christopher Nolan directing Oppenheimer (2023)</figcaption>
</figure>`,
      },
      {
        title: 'Embedding YouTube Videos',
        content:
          'YouTube provides an embed code for every video. It uses an <iframe> (inline frame) — a window to another web page embedded in yours. Find it by clicking Share → Embed on any YouTube video.',
        code: `<!-- Paste the embed code YouTube gives you -->
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID_HERE"
  title="Film trailer"
  frameborder="0"
  allowfullscreen>
</iframe>

<!-- Wrap in figure for accessibility -->
<figure>
  <iframe
    width="560" height="315"
    src="https://www.youtube.com/embed/n9xhJrPXop4"
    title="Dune: Part Two — Official Trailer"
    frameborder="0" allowfullscreen>
  </iframe>
  <figcaption>Dune: Part Two — Official Trailer</figcaption>
</figure>`,
      },
      {
        title: 'The picture Element (Responsive Images)',
        content:
          'The <picture> element lets you serve different image files at different screen sizes — a large image on desktop, a smaller crop on mobile.',
        code: `<picture>
  <!-- Use this image on screens wider than 800px -->
  <source srcset="images/banner-large.jpg" media="(min-width: 800px)">
  <!-- Use this image on screens wider than 400px -->
  <source srcset="images/banner-medium.jpg" media="(min-width: 400px)">
  <!-- Fallback image for small screens (or browsers that don't support picture) -->
  <img src="images/banner-small.jpg" alt="Cinema foyer">
</picture>`,
        tips: [
          'Always include an <img> as the last child of <picture> — it\'s the fallback if nothing else matches.',
        ],
      },
    ],
    keyPoints: [
      'src sets where the image file is; alt describes it in text',
      'Empty alt="" tells screen readers the image is decorative and can be skipped',
      'Wrap images with captions in <figure> and <figcaption>',
      'iframes embed other websites (like YouTube) inside your page',
      'Specify width and height on images to prevent layout shift while the page loads',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 5 — FORMS & INPUT
  // ─────────────────────────────────────────────────────────────
  {
    id: 'forms-input',
    title: 'Forms & Input',
    badge: 'HTML',
    color: '#ef6c00',
    intro:
      'Forms are how users send data to a website — booking tickets, searching, logging in, leaving a review. HTML provides a rich set of form elements and input types that handle common validation automatically.',
    sections: [
      {
        title: 'The form Element',
        content:
          'Every form starts with a <form> element. The action attribute says where to send the data; the method attribute says how (GET appends data to the URL, POST sends it invisibly in the request body — use POST for sensitive data).',
        code: `<form action="submit.php" method="POST">
  <!-- form fields go here -->
  <button type="submit">Send</button>
</form>`,
      },
      {
        title: 'Labels and Inputs',
        content:
          'Every input must have a matching <label>. Link them with the for attribute on the label matching the id on the input. This is essential for accessibility — clicking the label focuses the input, and screen readers announce the label when the field is focused.',
        code: `<!-- Linked with for/id matching -->
<label for="username">Username</label>
<input type="text" id="username" name="username" placeholder="Enter your name">

<!-- Labels can also wrap the input -->
<label>
  Email address
  <input type="email" name="email">
</label>`,
      },
      {
        title: 'Input Types',
        content:
          'The type attribute controls both what data is expected and what interface the browser shows (a date picker, a colour swatch, etc). Mobile browsers also show the appropriate keyboard.',
        table: {
          headers: ['type="..."', 'What it collects'],
          rows: [
            ['text', 'Any short text (default)'],
            ['email', 'An email address — validates @ and domain format'],
            ['password', 'Text that is hidden as the user types'],
            ['number', 'A number — can set min, max, and step'],
            ['date', 'A date — shows a date picker in modern browsers'],
            ['time', 'A time value'],
            ['tel', 'A phone number (no auto-validation — formats vary by country)'],
            ['url', 'A web address — validates it starts with https:// etc'],
            ['checkbox', 'A tick box (true/false)'],
            ['radio', 'One choice from a group (all radios share the same name)'],
            ['range', 'A slider between a min and max value'],
            ['color', 'A colour picker'],
            ['file', 'A file upload button'],
            ['hidden', 'Not shown to the user — sends data invisibly'],
            ['submit', 'A submit button (prefer <button type="submit">)'],
          ],
        },
      },
      {
        title: 'Select, Textarea, and Button',
        content:
          'For longer text, dropdown choices, and form submission:',
        code: `<!-- Dropdown select -->
<label for="genre">Favourite genre</label>
<select id="genre" name="genre">
  <option value="">-- Please choose --</option>
  <option value="action">Action</option>
  <option value="comedy">Comedy</option>
  <option value="drama">Drama</option>
  <option value="horror">Horror</option>
</select>

<!-- Multi-line text area -->
<label for="review">Your review</label>
<textarea id="review" name="review" rows="6" cols="40"
  placeholder="Write your review here..."></textarea>

<!-- Buttons -->
<button type="submit">Submit Review</button>
<button type="reset">Clear Form</button>
<button type="button" onclick="doSomething()">Click Me</button>`,
      },
      {
        title: 'Validation Attributes',
        content:
          'HTML provides built-in validation that runs before the form submits. No JavaScript needed for the basics.',
        table: {
          headers: ['Attribute', 'Effect'],
          rows: [
            ['required', 'Field must be filled in before submitting'],
            ['minlength="5"', 'Text must be at least 5 characters'],
            ['maxlength="100"', 'Text cannot exceed 100 characters'],
            ['min="1"', 'Minimum value for number/date/range inputs'],
            ['max="10"', 'Maximum value for number/date/range inputs'],
            ['pattern="[A-Za-z]+"', 'Must match a regular expression'],
            ['disabled', 'Field cannot be interacted with'],
            ['readonly', 'Field can be read but not changed'],
            ['autofocus', 'This field gets focus when the page loads'],
          ],
        },
        tips: [
          'required is the most used validation attribute — add it to any field that must be filled in.',
        ],
      },
      {
        title: 'Grouping with fieldset',
        content:
          'Use <fieldset> to group related fields and <legend> to give the group a title. Especially useful for radio buttons and checkboxes.',
        code: `<fieldset>
  <legend>Preferred screening time</legend>

  <label>
    <input type="radio" name="time" value="morning"> Morning
  </label>
  <label>
    <input type="radio" name="time" value="afternoon"> Afternoon
  </label>
  <label>
    <input type="radio" name="time" value="evening"> Evening
  </label>
</fieldset>`,
      },
    ],
    keyPoints: [
      'Every <input> needs a <label> linked via matching for and id attributes',
      'Use the correct type — email, tel, number etc. — for free built-in validation',
      'required makes the browser check the field is filled before submitting',
      'Use POST for sensitive data (passwords, personal info), GET for searches',
      'Radio buttons in a group must share the same name attribute',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 6 — CSS BASICS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'css-basics',
    title: 'CSS Basics',
    badge: 'CSS',
    color: '#0288d1',
    intro:
      'CSS (Cascading Style Sheets) controls how your HTML looks — colours, fonts, sizes, spacing, and layout. HTML provides structure; CSS provides style. Keeping them in separate files is best practice.',
    sections: [
      {
        title: 'Linking an External Stylesheet',
        content:
          'Place a <link> element inside the <head> of your HTML file. One CSS file can style an unlimited number of HTML pages.',
        code: `<head>
  <meta charset="UTF-8">
  <title>My Site</title>
  <!-- Link to your external CSS file -->
  <link rel="stylesheet" href="css/style.css">
</head>`,
        tips: [
          'Keep your CSS in a separate file (e.g. css/style.css), not mixed into the HTML with style="" attributes.',
        ],
      },
      {
        title: 'Selectors',
        content:
          'A selector targets which HTML elements you want to style. There are three main types you\'ll use every day.',
        code: `/* Element selector — targets ALL <p> tags */
p {
  color: navy;
}

/* Class selector — targets elements with class="highlight" */
.highlight {
  background-color: yellow;
}

/* ID selector — targets the ONE element with id="main-title" */
#main-title {
  font-size: 2rem;
}

/* Descendant selector — <a> tags inside a <nav> only */
nav a {
  text-decoration: none;
}

/* Multiple selectors — apply same rules to h1 AND h2 */
h1, h2 {
  font-family: Georgia, serif;
}`,
      },
      {
        title: 'Properties and Values',
        content:
          'CSS rules follow a simple pattern: selector { property: value; }. Each property controls one aspect of an element\'s appearance.',
        table: {
          headers: ['Property', 'What it controls'],
          rows: [
            ['color', 'Text colour'],
            ['background-color', 'Background colour of the element'],
            ['font-family', 'The typeface used'],
            ['font-size', 'Size of text (px, rem, em, %)'],
            ['font-weight', 'Thickness of text (normal, bold, 100-900)'],
            ['text-align', 'Horizontal alignment (left, center, right, justify)'],
            ['text-decoration', 'Underline, line-through, none'],
            ['line-height', 'Spacing between lines of text'],
            ['width / height', 'Dimensions of the element'],
            ['display', 'How the element sits in the flow (block, inline, flex, grid)'],
          ],
        },
      },
      {
        title: 'Colours in CSS',
        content:
          'CSS supports multiple ways to specify colour. Each has its uses.',
        code: `/* Named colours — easy to read, limited palette */
color: red;
background-color: aliceblue;

/* Hex codes — precise, most common */
color: #e63946;          /* short: #rgb */
color: #e6394680;        /* with alpha (transparency) */

/* RGB — good when you want to calculate colours */
color: rgb(230, 57, 70);
color: rgba(230, 57, 70, 0.5);   /* 0.5 = 50% transparent */

/* HSL — great for colour schemes (hue, saturation, lightness) */
color: hsl(356, 78%, 56%);
color: hsla(356, 78%, 56%, 0.8);`,
      },
      {
        title: 'The Cascade and Specificity',
        content:
          'When multiple rules target the same element, CSS uses specificity to decide which wins. Higher specificity overrides lower.',
        code: `/* Specificity order (lowest to highest): */

/* 1. Element selector */
p { color: black; }

/* 2. Class selector (overrides element) */
.intro { color: blue; }

/* 3. ID selector (overrides class) */
#hero-text { color: red; }

/* 4. Inline style (overrides ID) */
/* <p style="color: green;"> */

/* 5. !important (overrides everything — use sparingly) */
p { color: purple !important; }`,
        tips: [
          'Avoid !important wherever possible — it makes debugging very difficult.',
          'Prefer classes over IDs for styling — classes are more reusable.',
        ],
      },
    ],
    keyPoints: [
      'Link CSS with <link rel="stylesheet" href="file.css"> in the <head>',
      'Selectors: element (p), class (.name), ID (#name) — specificity increases in that order',
      'Every rule follows the pattern: selector { property: value; }',
      'The cascade means later rules override earlier ones (at the same specificity)',
      'Use classes for reusable styles; IDs for unique elements you reference in JavaScript',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 7 — THE BOX MODEL
  // ─────────────────────────────────────────────────────────────
  {
    id: 'box-model',
    title: 'The Box Model',
    badge: 'CSS',
    color: '#0288d1',
    intro:
      'Every HTML element is a rectangular box. The CSS box model describes the four layers that make up that box: content, padding, border, and margin. Understanding this model is fundamental to controlling layout and spacing.',
    sections: [
      {
        title: 'The Four Layers',
        content:
          'Starting from the inside and working outward: Content (the actual text or image), Padding (space between content and border), Border (a visible line around the padding), Margin (space outside the border, pushing other elements away).',
        code: `/*
  ┌──────────────────────────────┐
  │           MARGIN             │
  │  ┌────────────────────────┐  │
  │  │        BORDER          │  │
  │  │  ┌──────────────────┐  │  │
  │  │  │     PADDING      │  │  │
  │  │  │  ┌────────────┐  │  │  │
  │  │  │  │  CONTENT   │  │  │  │
  │  │  │  └────────────┘  │  │  │
  │  │  └──────────────────┘  │  │
  │  └────────────────────────┘  │
  └──────────────────────────────┘
*/

.box {
  /* Content */
  width: 300px;
  height: 150px;

  /* Padding (inside) */
  padding: 20px;

  /* Border */
  border: 2px solid #333;

  /* Margin (outside) */
  margin: 16px;
}`,
      },
      {
        title: 'Shorthand vs Longhand',
        content:
          'Padding and margin can be set for all four sides at once (shorthand) or individually (longhand). The shorthand goes clockwise: top, right, bottom, left.',
        code: `/* All four sides equal */
padding: 16px;

/* Top/bottom, left/right */
padding: 16px 24px;

/* Top, right, bottom, left (clockwise) */
padding: 10px 20px 10px 20px;

/* Individual sides (longhand) */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;

/* Same syntax applies to margin */
margin: 0 auto;  /* Classic trick: centres a block element horizontally */`,
      },
      {
        title: 'box-sizing: border-box',
        content:
          'By default (content-box), width is the content only — padding and border are added on top, making the element wider than expected. border-box includes padding and border inside the declared width. Always set border-box globally.',
        code: `/* Put this at the top of EVERY stylesheet */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Example: both boxes are 300px wide total */
.content-box {
  box-sizing: content-box;  /* default */
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* Actual width = 300 + 20 + 20 + 2 + 2 = 344px ← surprising! */
}

.border-box {
  box-sizing: border-box;  /* recommended */
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* Actual width = 300px exactly ← predictable */
}`,
      },
      {
        title: 'Display: block, inline, inline-block',
        content:
          'The display property controls how an element sits in the page flow.',
        table: {
          headers: ['display value', 'Behaviour'],
          rows: [
            ['block', 'Takes up the full width available; starts on a new line (div, p, h1, section)'],
            ['inline', 'Sits in the text flow; width/height have no effect (span, a, strong, em)'],
            ['inline-block', 'Sits in text flow but respects width and height (useful for buttons)'],
            ['none', 'Hides the element completely (removed from layout)'],
          ],
        },
        code: `/* Turn a block into an inline element */
li {
  display: inline;  /* navigation items side-by-side */
}

/* Centre a block element */
.container {
  width: 800px;
  margin: 0 auto;  /* auto left/right margin centres it */
}`,
      },
      {
        title: 'Borders',
        content:
          'Borders have three required values: width, style, and colour. Radius rounds the corners.',
        code: `/* Shorthand: width style color */
border: 2px solid #333;

/* Individual sides */
border-top: 4px solid #7c9ef5;
border-bottom: 1px dashed #ccc;

/* Rounded corners */
border-radius: 8px;       /* all corners */
border-radius: 50%;       /* circle (on a square element) */
border-radius: 4px 12px;  /* top-left/bottom-right, top-right/bottom-left */`,
      },
    ],
    keyPoints: [
      'Content → Padding → Border → Margin: inside to outside',
      'Always set box-sizing: border-box globally — it makes widths predictable',
      'margin: 0 auto centres a block element horizontally (the element needs a defined width)',
      'Padding is inside the border; margin is outside',
      'Block elements stack vertically; inline elements flow horizontally with text',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 8 — FLEXBOX
  // ─────────────────────────────────────────────────────────────
  {
    id: 'flexbox',
    title: 'Flexbox',
    badge: 'CSS',
    color: '#0288d1',
    intro:
      'Flexbox (Flexible Box Layout) is a CSS layout system designed for arranging items in a single row or column. It makes building navigation bars, card rows, and centred content dramatically simpler than older techniques.',
    sections: [
      {
        title: 'Container and Items',
        content:
          'You enable Flexbox on a parent element (the flex container). All its direct children automatically become flex items and are arranged according to the container\'s rules.',
        code: `<div class="card-row">
  <div class="card">Film 1</div>
  <div class="card">Film 2</div>
  <div class="card">Film 3</div>
</div>`,
      },
      {
        title: 'The Essential Properties',
        content:
          'Most Flexbox work is done with just five properties on the container:',
        code: `.card-row {
  display: flex;                    /* enables Flexbox */
  flex-direction: row;              /* row (default) or column */
  justify-content: space-between;   /* main axis alignment */
  align-items: center;              /* cross axis alignment */
  gap: 16px;                        /* space between items */
  flex-wrap: wrap;                  /* allow items to wrap to next line */
}`,
      },
      {
        title: 'justify-content — Main Axis',
        content:
          'justify-content distributes items along the main axis (horizontal in a row, vertical in a column).',
        table: {
          headers: ['Value', 'Effect'],
          rows: [
            ['flex-start', 'Items packed to the start (default)'],
            ['flex-end', 'Items packed to the end'],
            ['center', 'Items centred'],
            ['space-between', 'First item at start, last at end, equal gaps between'],
            ['space-around', 'Equal space on each side of every item'],
            ['space-evenly', 'Truly equal spacing including edges'],
          ],
        },
      },
      {
        title: 'align-items — Cross Axis',
        content:
          'align-items distributes items along the cross axis (vertical in a row, horizontal in a column).',
        table: {
          headers: ['Value', 'Effect'],
          rows: [
            ['stretch', 'Items fill the container height (default)'],
            ['flex-start', 'Items align to the top of the container'],
            ['flex-end', 'Items align to the bottom'],
            ['center', 'Items vertically centred'],
            ['baseline', 'Items aligned by their text baseline'],
          ],
        },
      },
      {
        title: 'Controlling Individual Items',
        content:
          'These properties go on the flex items themselves (not the container):',
        code: `.card {
  /* Flex item properties */
  flex-grow: 1;      /* item grows to fill available space (0 = don't grow) */
  flex-shrink: 1;    /* item can shrink if needed (0 = don't shrink) */
  flex-basis: 250px; /* preferred size before growing/shrinking */

  /* Shorthand: grow shrink basis */
  flex: 1 1 250px;

  /* Common shorthand values */
  flex: 1;           /* grow and fill equally */
  flex: 0 0 300px;   /* fixed 300px — don't grow or shrink */
}

/* Override alignment for one specific item */
.featured-card {
  align-self: flex-start;
}`,
      },
      {
        title: 'Common Patterns',
        content:
          'Flexbox handles these everyday layouts with just a few lines of CSS:',
        code: `/* Horizontal navigation bar */
nav ul {
  display: flex;
  list-style: none;
  gap: 24px;
  align-items: center;
  margin: 0;
  padding: 0;
}

/* Perfectly centred content (both axes) */
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Card grid that wraps at the right width */
.film-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.film-card {
  flex: 1 1 260px;   /* grow/shrink, but prefer 260px minimum */
  max-width: 350px;
}`,
      },
    ],
    keyPoints: [
      'display: flex on a parent makes its children flex items automatically',
      'justify-content controls the main axis (horizontal by default)',
      'align-items controls the cross axis (vertical by default)',
      'gap replaces margin hacks for spacing between items — cleaner and simpler',
      'flex-wrap: wrap allows items to drop to a new line instead of overflowing',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 9 — CSS GRID
  // ─────────────────────────────────────────────────────────────
  {
    id: 'css-grid',
    title: 'CSS Grid',
    badge: 'CSS',
    color: '#0288d1',
    intro:
      'CSS Grid is a two-dimensional layout system — it controls both rows and columns at the same time. Where Flexbox is ideal for a single row or column of items, Grid excels at complex page-level layouts and grids of cards.',
    sections: [
      {
        title: 'Grid vs Flexbox — When to Use Which',
        content:
          'A common question. The short answer: use Flexbox for one-dimensional arrangements (a navbar, a row of buttons), use Grid for two-dimensional arrangements (a full page layout, a card grid with precise row heights).',
        table: {
          headers: ['Flexbox', 'CSS Grid'],
          rows: [
            ['Works in one direction at a time', 'Controls rows AND columns simultaneously'],
            ['Content determines layout', 'Layout is defined independently of content'],
            ['Navigation bars, button groups, card rows', 'Page layouts, image galleries, complex grids'],
            ['Items can grow/shrink fluidly', 'Items can span across multiple rows or columns'],
          ],
        },
      },
      {
        title: 'Creating a Grid',
        content:
          'Add display: grid to a container and define your columns with grid-template-columns.',
        code: `.film-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* three equal columns */
  gap: 16px;
}

/* Children automatically fill cells left-to-right, top-to-bottom */`,
      },
      {
        title: 'repeat() and minmax()',
        content:
          'These two functions make grids flexible. repeat() saves repetition; minmax() sets a minimum and maximum size for a track.',
        code: `/* Three equal columns — longhand */
grid-template-columns: 1fr 1fr 1fr;

/* Same thing with repeat() */
grid-template-columns: repeat(3, 1fr);

/* Auto-fill: as many columns as fit, each at least 250px */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

/* Auto-fit: similar but collapses empty tracks */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

/* Mixed: fixed sidebar + fluid content */
grid-template-columns: 200px 1fr;

/* Three rows */
grid-template-rows: 80px 1fr auto;`,
        tips: [
          'repeat(auto-fill, minmax(250px, 1fr)) is the magic responsive grid recipe — no media queries needed.',
        ],
      },
      {
        title: 'Placing Items',
        content:
          'By default items flow into the next available cell. You can override this by specifying column and row positions.',
        code: `/* Using grid lines (1-indexed) */
.featured {
  grid-column: 1 / 3;   /* span from line 1 to line 3 (2 columns wide) */
  grid-row: 1 / 2;      /* first row only */
}

/* Using span keyword */
.wide-card {
  grid-column: span 2;  /* spans 2 columns from wherever it lands */
}

/* Shorthand: row-start / column-start / row-end / column-end */
.header-area {
  grid-area: 1 / 1 / 2 / 4;
}`,
      },
      {
        title: 'Named Template Areas',
        content:
          'grid-template-areas lets you define your layout visually using names. Each string is a row; each word in the string is a column.',
        code: `.page {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
  gap: 0;
}

/* Assign items to named areas */
header  { grid-area: header; }
nav     { grid-area: sidebar; }
main    { grid-area: main; }
footer  { grid-area: footer; }`,
      },
    ],
    keyPoints: [
      'display: grid on a parent turns its children into grid items',
      'grid-template-columns defines the number and size of columns',
      'fr is the "fraction" unit — 1fr means "one share of available space"',
      'repeat(auto-fill, minmax(250px, 1fr)) creates a responsive grid with no media queries',
      'Items can span multiple columns or rows with grid-column: span 2',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 10 — RESPONSIVE DESIGN
  // ─────────────────────────────────────────────────────────────
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    badge: 'CSS',
    color: '#0288d1',
    intro:
      'Responsive design means your website adapts to look good on any screen — a 4K desktop monitor, a tablet, and a phone in portrait mode. It\'s achieved through flexible layouts, relative units, and media queries.',
    sections: [
      {
        title: 'The Viewport Meta Tag',
        content:
          'Without this tag in your <head>, mobile browsers scale your desktop page down to fit the screen — making everything tiny. This single line tells the browser to use the device\'s real width.',
        code: `<!-- This must be in every HTML page's <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        tips: [
          'If your page looks zoomed out on mobile, you\'ve probably forgotten this meta tag.',
        ],
      },
      {
        title: 'Relative Units',
        content:
          'Relative units scale with context. Mixing fixed px with responsive units is one of the most common causes of poor mobile layouts.',
        table: {
          headers: ['Unit', 'Relative to'],
          rows: [
            ['rem', 'Root element font size (usually 16px). 1.5rem = 24px. Best for font sizes and spacing.'],
            ['em', 'Parent element font size. Compounds — can get complex in nested elements.'],
            ['%', 'Parent element\'s dimension. 50% width = half the parent width.'],
            ['vw', 'Viewport width. 100vw = full screen width.'],
            ['vh', 'Viewport height. 100vh = full screen height.'],
            ['vmin', 'The smaller of vw and vh.'],
            ['vmax', 'The larger of vw and vh.'],
            ['ch', 'Width of the "0" character in the current font. Useful for limiting line length.'],
          ],
        },
      },
      {
        title: 'Media Queries',
        content:
          'A media query applies CSS rules only when a condition is true — typically when the screen is narrower or wider than a certain width.',
        code: `/* These styles apply ALWAYS */
body {
  font-size: 1rem;
}

.film-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* These styles apply ONLY on screens 768px wide or less */
@media (max-width: 768px) {
  .film-grid {
    grid-template-columns: 1fr;  /* single column on mobile */
  }
}

/* Screens between 768px and 1024px */
@media (min-width: 769px) and (max-width: 1024px) {
  .film-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}`,
      },
      {
        title: 'Mobile-First Approach',
        content:
          'Mobile-first means you write your base CSS for small screens, then add media queries that kick in for larger screens. This is generally considered best practice.',
        code: `/* Mobile-first: base styles are for small screens */
.film-grid {
  display: grid;
  grid-template-columns: 1fr;  /* 1 column on mobile */
  gap: 12px;
}

/* Tablet: 2 columns */
@media (min-width: 600px) {
  .film-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1000px) {
  .film-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}`,
      },
      {
        title: 'Common Breakpoints',
        content:
          'There are no universal breakpoints — they should be based on your content, not device sizes. These are common starting points.',
        table: {
          headers: ['Breakpoint', 'Typical use'],
          rows: [
            ['480px', 'Large phones (landscape)'],
            ['600px', 'Small tablets / large phones'],
            ['768px', 'Tablets (portrait)'],
            ['1024px', 'Tablets (landscape) / small laptops'],
            ['1200px', 'Desktops'],
            ['1440px', 'Large desktops'],
          ],
        },
        tips: [
          'Add breakpoints where your content looks broken, not at specific device sizes.',
        ],
      },
      {
        title: 'Responsive Images',
        content:
          'Images need special attention in responsive design. They should never overflow their container.',
        code: `/* Make all images responsive by default */
img {
  max-width: 100%;
  height: auto;  /* maintains aspect ratio */
  display: block;
}

/* Hero image that fills the screen */
.hero-image {
  width: 100%;
  height: 60vh;
  object-fit: cover;    /* crops to fill without stretching */
  object-position: center top;
}`,
      },
    ],
    keyPoints: [
      'The viewport meta tag is required on every page for correct mobile rendering',
      'Use rem for font sizes and spacing — it scales with user preferences',
      'Mobile-first: write base styles for mobile, add min-width media queries for larger screens',
      'max-width: 100%; height: auto on images prevents them overflowing their container',
      'Test on real devices or Chrome DevTools mobile simulation throughout development',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 11 — DESIGN PRINCIPLES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'design-principles',
    title: 'Design Principles',
    badge: 'Design',
    color: '#6a1b9a',
    intro:
      'Good design is not just about making things look pretty — it\'s about communicating clearly. Understanding a few core principles helps you make intentional design decisions rather than guessing.',
    sections: [
      {
        title: 'CRAP — The Four Core Principles',
        content:
          'CRAP is a memorable acronym from Robin Williams\' "The Non-Designer\'s Design Book". Apply all four and most designs improve immediately.',
        table: {
          headers: ['Principle', 'What it means'],
          rows: [
            ['Contrast', 'Make different things look different. If they\'re not the same, make them very different — not slightly different.'],
            ['Repetition', 'Repeat visual elements throughout the design (same button style, same heading font, same colour palette) to create unity.'],
            ['Alignment', 'Nothing should be placed on the page arbitrarily. Every element should have a visual connection to something else.'],
            ['Proximity', 'Group related items together. Separate unrelated items. White space is not wasted space — it creates groups.'],
          ],
        },
      },
      {
        title: 'Visual Hierarchy',
        content:
          'Visual hierarchy guides the reader\'s eye in the intended order. The most important element should be the most visually dominant.',
        code: `/* Size creates hierarchy */
h1 { font-size: 3rem;   font-weight: 800; }
h2 { font-size: 2rem;   font-weight: 700; }
h3 { font-size: 1.5rem; font-weight: 600; }
p  { font-size: 1rem;   font-weight: 400; }

/* Weight and colour reinforce hierarchy */
.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7c9ef5;       /* accent colour to draw attention */
}`,
      },
      {
        title: 'Colour and Contrast',
        content:
          'Limit your palette. A good starting point is one primary colour, one accent, one dark, and one light. WCAG AA accessibility standard requires a contrast ratio of 4.5:1 for normal text.',
        code: `/* Practical colour system using CSS custom properties */
:root {
  --color-primary:    #1a1a2e;  /* dark navy — backgrounds */
  --color-surface:    #16213e;  /* slightly lighter — cards */
  --color-accent:     #7c9ef5;  /* blue — interactive elements */
  --color-text:       #e2e2f0;  /* off-white — body text */
  --color-text-muted: #9898b8;  /* dimmed — secondary text */
}

/* Use the variables */
body           { background: var(--color-primary); color: var(--color-text); }
.card          { background: var(--color-surface); }
a, .btn        { color: var(--color-accent); }
.caption       { color: var(--color-text-muted); }`,
        tips: [
          'Use the WebAIM Contrast Checker (webaim.org/resources/contrastchecker) to verify your text colours pass WCAG.',
        ],
      },
      {
        title: 'Typography Scale',
        content:
          'A typographic scale creates visual order. Instead of choosing font sizes randomly, pick a ratio (1.25 — "Major Third" is popular) and derive each level from it.',
        code: `/* Modular scale at 1.25 ratio (base: 16px) */
:root {
  --text-xs:   0.64rem;    /*  ~10px  — labels, captions */
  --text-sm:   0.8rem;     /*  ~13px  — small print */
  --text-base: 1rem;       /*   16px  — body text */
  --text-md:   1.25rem;    /*   20px  — large body / small headings */
  --text-lg:   1.563rem;   /*   25px  — h3 */
  --text-xl:   1.953rem;   /*   31px  — h2 */
  --text-2xl:  2.441rem;   /*   39px  — h1 */
  --text-3xl:  3.052rem;   /*   49px  — hero headings */
}`,
      },
      {
        title: 'Spacing and Whitespace',
        content:
          'Consistent spacing makes a design feel ordered and professional. Use a spacing scale based on multiples of a base unit (4px or 8px are common).',
        code: `/* 8px spacing scale */
:root {
  --space-1:  4px;    /* tight internal spacing */
  --space-2:  8px;    /* default padding */
  --space-3:  12px;
  --space-4:  16px;   /* default gap between elements */
  --space-5:  24px;
  --space-6:  32px;
  --space-8:  48px;   /* section spacing */
  --space-10: 64px;   /* large section breaks */
}

/* Don't fear whitespace — padding and margins are not wasted space */
.card {
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}`,
      },
    ],
    keyPoints: [
      'Contrast, Repetition, Alignment, Proximity — apply CRAP to every design decision',
      'Define a colour palette with CSS custom properties and use it consistently',
      'Font size alone doesn\'t create hierarchy — weight, colour, and spacing all contribute',
      'Whitespace is an active design element, not empty space to be filled',
      'Limit yourself to 2 typefaces maximum — one for headings, one for body text',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 12 — ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'accessibility',
    title: 'Accessibility',
    badge: 'A11y',
    color: '#2e7d32',
    intro:
      'Web accessibility (a11y) means making your site usable by everyone — including people who use screen readers, keyboard-only navigation, or have visual, motor, or cognitive disabilities. In the UK, public sector websites are legally required to meet WCAG 2.1 AA standard.',
    sections: [
      {
        title: 'Alt Text (Already Covered — Still the #1 Failure)',
        content:
          'Missing or poor alt text is the single most common accessibility failure. Every meaningful image must describe what it shows. Decorative images use empty alt="".',
        code: `<!-- Good alt text -->
<img src="poster.jpg" alt="Movie poster: Inception — a man in a suit stands in a spinning corridor">

<!-- Decorative image — screen reader skips it -->
<img src="divider-pattern.svg" alt="">

<!-- Image of text — write out the actual text -->
<img src="title-card.png" alt="Now Showing — Summer 2025">`,
      },
      {
        title: 'Semantic HTML is Accessibility',
        content:
          'The biggest thing you can do for accessibility is use the right HTML elements. Screen readers know what a <nav>, <button>, <h1>, and <label> mean. They don\'t know what a <div> means.',
        code: `<!-- BAD: a div pretending to be a button -->
<div class="btn" onclick="submit()">Submit</div>

<!-- GOOD: an actual button — keyboard focusable, screen reader says "Submit, button" -->
<button type="submit">Submit</button>

<!-- BAD: a span pretending to be a heading -->
<span class="big-text">Latest Films</span>

<!-- GOOD: a real heading — screen readers build a navigation outline from these -->
<h2>Latest Films</h2>`,
      },
      {
        title: 'Form Labels',
        content:
          'Every form input must have a label that is programmatically associated with it (not just visually near it). Screen readers announce the label when the user focuses the input.',
        code: `<!-- Linked via for/id matching -->
<label for="email">Email address</label>
<input type="email" id="email" name="email">

<!-- Or wrapping -->
<label>
  Phone number
  <input type="tel" name="phone">
</label>

<!-- If you truly can't show a visible label, use aria-label instead -->
<input type="search" aria-label="Search films" placeholder="Search...">`,
      },
      {
        title: 'Keyboard Navigation',
        content:
          'Users who cannot use a mouse navigate with Tab (next), Shift+Tab (previous), Enter/Space (activate). Your site must be fully usable without a mouse. The currently focused element must always be visible.',
        code: `/* NEVER do this — it makes keyboard navigation invisible */
*:focus {
  outline: none;  /* ← this is an accessibility failure */
}

/* GOOD — clear, visible focus indicator */
:focus-visible {
  outline: 3px solid #7c9ef5;
  outline-offset: 2px;
}

/* Custom focus for buttons */
button:focus-visible {
  outline: 3px solid #7c9ef5;
  outline-offset: 4px;
  border-radius: 4px;
}`,
      },
      {
        title: 'ARIA Attributes',
        content:
          'ARIA (Accessible Rich Internet Applications) attributes fill gaps where HTML semantics don\'t stretch far enough. Use them when semantic HTML alone isn\'t sufficient — but always prefer a semantic element over an ARIA workaround.',
        table: {
          headers: ['Attribute', 'Used for'],
          rows: [
            ['aria-label="..."', 'Provides an accessible name when a visible label isn\'t possible'],
            ['aria-labelledby="id"', 'Points to another element that serves as the label'],
            ['aria-describedby="id"', 'Points to an element with additional descriptive text'],
            ['aria-hidden="true"', 'Hides decorative elements from screen readers'],
            ['aria-expanded="true/false"', 'Indicates if a dropdown or accordion is open'],
            ['aria-current="page"', 'Marks the current page in a navigation menu'],
            ['role="..."', 'Overrides the element\'s implied role (use sparingly)'],
          ],
        },
        code: `<!-- Marking current page in navigation -->
<nav>
  <ul>
    <li><a href="index.html" aria-current="page">Home</a></li>
    <li><a href="films.html">Films</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>

<!-- Icon button with accessible name -->
<button aria-label="Close menu">
  <svg aria-hidden="true">...</svg>
</button>`,
      },
      {
        title: 'Colour Contrast',
        content:
          'WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold+). Check your colours with a contrast checker tool.',
        code: `/* Example: testing contrast in your CSS */

/* FAIL — grey text on white background is often too low contrast */
.caption {
  color: #aaaaaa;  /* contrast vs white: ~2.3:1 — fails AA */
}

/* PASS — darker grey passes */
.caption {
  color: #767676;  /* contrast vs white: ~4.5:1 — passes AA */
}

/* High contrast text on dark background */
.dark-card {
  background: #1e1e2e;
  color: #e2e2f0;  /* contrast: ~11:1 — well above requirement */
}`,
      },
    ],
    keyPoints: [
      'Use semantic HTML — it\'s the most powerful accessibility tool available',
      'Every image needs meaningful alt text, or alt="" if decorative',
      'Every form input needs a programmatically linked label',
      'Never remove focus outlines — keyboard users depend on them to know where they are',
      'WCAG AA requires 4.5:1 contrast for normal text — use a checker to verify',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CHAPTER 13 — MICRO-INTERACTIONS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'micro-interactions',
    title: 'Micro-interactions',
    badge: 'CSS',
    color: '#00838f',
    intro:
      'Micro-interactions are the small animations and responses that make a UI feel alive — a button that shifts slightly when hovered, a card that lifts on focus, a link that smoothly changes colour. CSS handles these elegantly with transitions and transforms.',
    sections: [
      {
        title: 'CSS Transitions',
        content:
          'The transition property makes a CSS value change gradually over a set time, rather than jumping instantly. You specify which property to animate, how long it takes, and the timing curve.',
        code: `/* Syntax: property duration timing-function delay */
.btn {
  background-color: #7c9ef5;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #9db4ff;  /* now fades smoothly over 0.2s */
}

/* Transition multiple properties */
.card {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);                /* lifts up */
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);    /* shadow deepens */
}`,
      },
      {
        title: 'Timing Functions',
        content:
          'The timing function controls the speed curve of the transition.',
        table: {
          headers: ['Value', 'Effect'],
          rows: [
            ['ease', 'Slow start, fast middle, slow end (default — feels natural)'],
            ['linear', 'Constant speed (good for spinning animations)'],
            ['ease-in', 'Slow start, fast end (feels like accelerating)'],
            ['ease-out', 'Fast start, slow end (feels like decelerating — natural for appearing elements)'],
            ['ease-in-out', 'Slow start, fast middle, slow end (symmetrical)'],
            ['cubic-bezier(x1,y1,x2,y2)', 'Custom curve — fine-tune any easing'],
          ],
        },
      },
      {
        title: 'CSS Transform',
        content:
          'transform moves, rotates, scales, or skews an element visually without affecting the layout around it. Combining transform with transition creates smooth motion.',
        code: `/* Translation (moving without affecting layout) */
.menu-icon:hover {
  transform: translateX(4px);    /* move right */
}

/* Scaling */
.thumb:hover {
  transform: scale(1.05);        /* 5% bigger */
}

.badge:hover {
  transform: scale(0.95);        /* 5% smaller — "pressed" feel */
}

/* Rotation */
.spinner {
  transform: rotate(45deg);
}

/* Multiple transforms — combine with space */
.card:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Transform origin */
.logo:hover {
  transform: rotate(10deg);
  transform-origin: bottom left;  /* rotates around bottom-left corner */
}`,
      },
      {
        title: 'Pseudo-classes for Interactivity',
        content:
          'These CSS pseudo-classes select elements based on user interaction state.',
        table: {
          headers: ['Pseudo-class', 'When it applies'],
          rows: [
            [':hover', 'Mouse cursor is over the element'],
            [':focus', 'Element has keyboard or click focus'],
            [':focus-visible', 'Element has keyboard focus specifically (preferred over :focus for outlines)'],
            [':active', 'Element is being clicked (between mousedown and mouseup)'],
            [':visited', 'A link the user has already visited'],
            [':disabled', 'A form element with the disabled attribute'],
            [':checked', 'A checkbox or radio that is checked'],
            [':placeholder-shown', 'An input whose placeholder is currently visible'],
          ],
        },
      },
      {
        title: 'CSS Animations with @keyframes',
        content:
          'For more complex motion than a simple A→B transition, use @keyframes to define multi-step animations.',
        code: `/* Define the animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply it to an element */
.card {
  animation: fade-in-up 0.4s ease-out both;
}

/* Stagger cards in a grid */
.card:nth-child(1) { animation-delay: 0s; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.2s; }

/* Looping animation (loading spinner) */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader {
  animation: spin 1s linear infinite;
}`,
      },
      {
        title: 'Practical Polish Examples',
        content:
          'These patterns come up again and again in real projects:',
        code: `/* Underline grows in from left on hover */
.nav-link {
  position: relative;
  text-decoration: none;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.25s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Button press effect */
.btn {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.4);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}`,
        tips: [
          'Respect user preferences: @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }',
        ],
      },
    ],
    keyPoints: [
      'transition animates a change between two CSS states — add it to the base element, not just the :hover state',
      'transform (translate, scale, rotate) does not affect page layout — other elements don\'t move',
      'Combine transform and transition for the most polished hover effects',
      '@keyframes defines multi-step animations; animation applies them',
      'Always check prefers-reduced-motion — some users experience motion sickness from animations',
    ],
  },
];
