#!/usr/bin/env node
/**
 * Rewrite the high-traffic Indian diet-plan article with clean Lexical content,
 * safer medical framing, consistent metadata, and structured FAQs.
 *
 * Dry-run is the default:
 *   node --env-file=.env.local scripts/rewrite-indian-diet-plan.mjs
 *   node --env-file=.env.local scripts/rewrite-indian-diet-plan.mjs --apply
 */

import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { writePageBlocks } from './lib/write-page-blocks.mjs';

const { Client } = pg;
const apply = process.argv.includes('--apply');
const slug = 'indian-diet-plan-to-lose-10-kg-in-1-month-your-complete-guide';

const title = 'Can You Lose 10 kg in 1 Month? Safe Indian Diet Plan';
const excerpt =
  'Can you safely lose 10 kg in one month? Explore a realistic Indian meal framework, vegetarian and non-vegetarian options, and medically reviewed weight-loss guidance.';
const metaTitle = 'Can You Lose 10 Kg in 1 Month? Indian Diet Plan | Uncover';
const metaDescription =
  'Can you safely lose 10 kg in one month? Get a realistic Indian meal framework, vegetarian and non-vegetarian options, and medically reviewed guidance.';

const sectionMarkdown = [
  {
    heading: 'Can you safely lose 10 kg in one month?',
    markdown: `Many people search for a fast Indian diet plan because they want a clear target and quick visible progress. But losing 10 kg in four weeks is an aggressive goal for most adults and should not be presented as a guaranteed result.

The number on the scale can fall quickly during the first week because the body stores less water and glycogen when food intake changes. That early movement is not the same as losing 10 kg of body fat. The US Centers for Disease Control and Prevention describes gradual loss of about 1–2 lb (roughly 0.5–0.9 kg) per week as more sustainable for many people.

Some people with a higher starting weight may lose faster under medical supervision. Others may progress more slowly because of sleep, stress, medicines, thyroid conditions, PCOS, menopause, diabetes, mobility limitations or previous dieting. A safe plan therefore starts with your health context—not a deadline taken from a search result.`,
  },
  {
    kind: 'takeaways',
    heading: 'Key Takeaways',
    items: [
      { text: 'A 10 kg loss in one month is not a safe or realistic promise for most adults.' },
      { text: 'A sustainable plan combines balanced meals, movement, sleep, stress management and regular monitoring.' },
      { text: 'There is no single calorie target or meal chart that is appropriate for everyone.' },
      { text: 'Indian foods such as dal, curd, paneer, eggs, fish, chicken, vegetables and whole grains can all fit into a weight-management plan.' },
      { text: 'Seek personalised medical advice if you have a health condition, take regular medicines, are pregnant or breastfeeding, or have a history of disordered eating.' },
    ],
  },
  {
    heading: 'Start with your health context, not only your weight',
    markdown: `Weight is only one part of a health assessment. A clinician may also review waist measurement, blood pressure, blood sugar, cholesterol, sleep, menstrual history, medicines, previous weight changes and family history. Body mass index can be a useful screening measure, but it does not describe body composition or health by itself.

Speak with a qualified healthcare professional before starting a restrictive plan if you:

- are younger than 18;
- are pregnant, breastfeeding or trying to conceive;
- have diabetes, kidney disease, liver disease, gallstones or a thyroid condition;
- take medicines that affect appetite, blood sugar or blood pressure;
- have frequent dizziness, fainting, weakness or irregular periods; or
- have a current or previous eating disorder.

The goal is not to make weight loss complicated. It is to avoid using a generic meal chart where an individual assessment is needed.`,
  },
  {
    heading: 'How sustainable fat loss works',
    markdown: `Body fat decreases when energy intake remains below energy use over time. The appropriate deficit depends on body size, age, sex, activity, health conditions and treatment plan. This is why a universal 1,000-calorie or 1,200-calorie prescription is not appropriate for every reader.

A useful plan should still provide enough protein, fibre, essential fats, vitamins and minerals. It should also be practical enough to continue during workdays, family meals, festivals and travel. Severe restriction may produce a quick scale change, but it can also increase hunger, fatigue, nutrient gaps and the likelihood of regaining weight.

Instead of trying to make every meal as small as possible, build meals around three priorities:

1. **Protein:** dal, beans, chana, rajma, soy, tofu, paneer, curd, eggs, fish or lean chicken.
2. **Fibre and volume:** vegetables, salads, whole fruits and minimally processed grains.
3. **A manageable carbohydrate portion:** roti, rice, millets, oats, poha, idli or another familiar staple.

The Indian Council of Medical Research–National Institute of Nutrition dietary guidelines emphasise variety, minimally processed foods and balanced meals rather than dependence on one “fat-burning” ingredient.`,
  },
  {
    heading: 'A practical Indian meal-building framework',
    markdown: `Use the following framework as a set of options—not as a prescription. Portion sizes should reflect your appetite, activity, health and clinician’s advice.

### Breakfast

- Vegetable poha with curd or an egg.
- Two small vegetable besan chillas with mint chutney.
- Idli with sambar and extra vegetables.
- Oats or daliya cooked with vegetables, plus curd, paneer or eggs.
- Moong dal chilla with a paneer or tofu filling.

### Lunch

- Roti with dal, seasonal sabzi, salad and curd.
- Brown or regular rice with rajma or chole and a vegetable side.
- Millet roti with paneer, tofu, fish or chicken and cooked vegetables.
- Khichdi with vegetables, curd and salad.

### Optional snack

Choose a snack if you are genuinely hungry or have a long gap between meals:

- one whole fruit;
- unsweetened curd;
- roasted chana;
- a small handful of nuts;
- sprouts chaat; or
- tea or coffee without frequent sugary accompaniments.

### Dinner

- Dal or bean soup with vegetables and roti.
- Paneer, tofu, fish, egg or chicken with vegetables and a moderate grain portion.
- Vegetable khichdi with curd.
- A home-style curry with salad and roti or rice.

You do not need detox drinks, imported superfoods or a separate “diet meal” for every sitting. Water, regular home-cooked food and consistent portions are usually a more sustainable foundation.`,
  },
  {
    heading: 'Seven-day Indian meal example',
    markdown: `This example shows how familiar foods can be rotated. Swap vegetarian and non-vegetarian proteins according to preference, and adjust portions with professional guidance when needed.

1. **Day 1:** Vegetable poha with curd; dal, roti, sabzi and salad; fruit or roasted chana; paneer or chicken with vegetables and roti.
2. **Day 2:** Moong dal chilla; rajma rice with salad; curd; vegetable soup with tofu, egg or fish.
3. **Day 3:** Idli and sambar; millet roti with dal and sabzi; fruit and nuts; vegetable khichdi with curd.
4. **Day 4:** Oats with vegetables and eggs or paneer; chole with rice and salad; sprouts chaat; grilled fish, chicken or tofu with vegetables.
5. **Day 5:** Besan chilla with curd; roti, dal and mixed vegetables; fruit; paneer bhurji or egg bhurji with roti and salad.
6. **Day 6:** Daliya with vegetables; sambar rice with a vegetable side; roasted makhana; dal soup with roti and sautéed vegetables.
7. **Day 7:** Upma with sambar or curd; home-style chicken, fish, paneer or soy curry with rice and salad; fruit; a lighter portion of the family dinner.

Repeatedly skipping meals is not required. If fasting leads to overeating, headaches or poor concentration later, a regular meal pattern may work better for you.`,
  },
  {
    heading: 'Habits that make the plan work',
    markdown: `A meal chart cannot compensate for an unsustainable routine. Focus on behaviours you can repeat:

- **Include protein at each main meal.** It supports fullness and helps preserve lean tissue during weight loss.
- **Prefer whole fruit to juice.** Fruit provides fibre and is easier to portion than sweetened drinks.
- **Measure cooking oil rather than pouring freely.** Oil is useful, but small amounts add substantial energy.
- **Limit liquid calories.** Sugary tea, coffee, soft drinks, alcohol and packaged juices can quietly increase intake.
- **Move regularly.** Aim to build toward at least 150 minutes of moderate activity weekly if medically appropriate, with muscle-strengthening activity on two or more days.
- **Sleep consistently.** Poor sleep can affect hunger, recovery and food choices.
- **Plan for restaurant meals.** Choose one indulgence, add vegetables or protein, and return to your routine at the next meal instead of compensating with starvation.

Consistency across several weeks matters more than a single “perfect” day.`,
  },
  {
    heading: 'How to monitor progress without chasing the scale',
    markdown: `Body weight changes from water, salt intake, menstrual cycles, bowel movements and the timing of your last meal. Weigh under similar conditions once or a few times weekly and look at the trend rather than one reading.

Also monitor:

- waist measurement every two to four weeks;
- energy and concentration;
- strength and exercise tolerance;
- sleep quality;
- hunger and cravings; and
- whether the routine fits your normal life.

If progress stalls for several weeks, review portions, drinks, weekend eating, activity, sleep and medicines with a professional. Do not respond automatically by cutting food to an extreme level.`,
  },
  {
    heading: 'What results are realistic?',
    markdown: `At a commonly recommended gradual pace, losing 10 kg may take roughly 10–20 weeks or longer. This is an estimate, not a guarantee. The best timeline is one that protects nutrition, muscle, energy and long-term adherence.

Stop the plan and seek medical advice if you experience persistent dizziness, fainting, palpitations, severe weakness, repeated vomiting, confusion or other concerning symptoms. If thoughts about food or weight are causing distress or compulsive behaviour, seek support from a qualified mental-health or eating-disorder professional.

Weight management is successful when it improves health and can be maintained—not when it produces the fastest short-term number.`,
  },
  {
    heading: 'Getting personalised support',
    markdown: `If you would like structured support, explore Uncover’s [weight management programme](https://uncover.co.in/treatment/weight-management-program), learn how we approach [weight-loss concerns](https://uncover.co.in/concern/weight-loss), browse related [body treatments](https://uncover.co.in/c/body), or read our guide to [fat-burning drinks](https://uncover.co.in/post/7-indian-fat-burning-drinks-that-can-actually-help-you-lose-belly-fat).

A consultation can help determine whether lifestyle changes are sufficient or whether blood tests, medicine review or another treatment pathway should be considered.`,
  },
  {
    heading: 'Medical references',
    markdown: `This article’s safety framing is informed by:

- [CDC: Steps for Losing Weight](https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html)
- [NIDDK: Choosing a Safe and Successful Weight-loss Program](https://www.niddk.nih.gov/health-information/weight-management/choosing-a-safe-successful-weight-loss-program)
- [ICMR–National Institute of Nutrition: Dietary Guidelines for Indians 2024](https://nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf)`,
  },
];

const faqs = [
  {
    question: 'Can I safely lose 10 kg in one month?',
    answer:
      'For most adults, losing 10 kg in four weeks is an aggressive target and should not be promised. A gradual pace of roughly 0.5–0.9 kg per week is commonly recommended, although individual progress varies. Faster loss should occur only with appropriate medical supervision.',
  },
  {
    question: 'Is a 1,000-calorie Indian diet safe?',
    answer:
      'There is no universal calorie target. A 1,000-calorie plan may be too restrictive for many adults and may not meet protein or micronutrient needs. Calorie intake should be personalised according to body size, health, activity, medicines and clinical goals.',
  },
  {
    question: 'How long does it usually take to lose 10 kg?',
    answer:
      'At a gradual pace of about 0.5–0.9 kg per week, losing 10 kg may take roughly 10–20 weeks or longer. Weight loss is not linear, and your starting weight, health, sleep, activity and adherence all influence the timeline.',
  },
  {
    question: 'Which Indian foods are useful for weight management?',
    answer:
      'Build meals around vegetables, whole fruits, dal, beans, chana, curd, paneer, tofu, eggs, fish or lean chicken, with a manageable portion of roti, rice, millet, oats, poha or another familiar grain. Variety and portions matter more than one “fat-burning” food.',
  },
  {
    question: 'Who should consult a doctor before starting a weight-loss diet?',
    answer:
      'Seek personalised advice if you are pregnant or breastfeeding, are under 18, have diabetes, kidney or liver disease, take regular medicines, experience unexplained weight changes, or have a current or previous eating disorder.',
  },
];

function textNode(text, format = 0) {
  return {
    mode: 'normal',
    text,
    type: 'text',
    style: '',
    detail: 0,
    format,
    version: 1,
  };
}

function linkNode(label, url) {
  return {
    id: randomUUID(),
    type: 'link',
    fields: { url, newTab: false, linkType: 'custom' },
    format: '',
    indent: 0,
    version: 3,
    children: [textNode(label)],
    direction: null,
  };
}

function inlineNodes(value) {
  const nodes = [];
  const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  for (const match of value.matchAll(tokenPattern)) {
    if (match.index > cursor) nodes.push(textNode(value.slice(cursor, match.index)));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(textNode(token.slice(2, -2), 1));
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      nodes.push(linkNode(linkMatch[1], linkMatch[2]));
    }
    cursor = match.index + token.length;
  }
  if (cursor < value.length) nodes.push(textNode(value.slice(cursor)));
  return nodes.length ? nodes : [textNode('')];
}

function paragraphNode(value) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
    children: inlineNodes(value),
  };
}

function headingNode(value, tag = 'h3') {
  return {
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: inlineNodes(value),
  };
}

function listNode(lines, ordered) {
  return {
    tag: ordered ? 'ol' : 'ul',
    type: 'list',
    start: 1,
    format: '',
    indent: 0,
    version: 1,
    listType: ordered ? 'number' : 'bullet',
    direction: 'ltr',
    children: lines.map((line, index) => ({
      type: 'listitem',
      value: index + 1,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: inlineNodes(line),
    })),
  };
}

/** Minimal converter for the deliberately bounded Markdown used below. */
function markdownToLexical(markdown) {
  const lines = markdown.trim().split('\n');
  const children = [];
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    children.push(paragraphNode(paragraph.join(' ')));
    paragraph = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const heading = /^(#{3,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      children.push(headingNode(heading[2], `h${heading[1].length}`));
      continue;
    }
    const bullet = /^-\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const listLines = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        const item = ordered ? /^\d+\.\s+(.+)$/.exec(current) : /^-\s+(.+)$/.exec(current);
        if (!item) break;
        listLines.push(item[1]);
        index += 1;
      }
      index -= 1;
      children.push(listNode(listLines, ordered));
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  };
}

function sectionsForBlocks() {
  return sectionMarkdown.map((section) =>
    section.kind === 'takeaways'
      ? section
      : { heading: section.heading, content: markdownToLexical(section.markdown) },
  );
}

function fullArticleLexical() {
  const markdown = sectionMarkdown
    .map((section) => {
      if (section.kind === 'takeaways') {
        return `## ${section.heading}\n\n${section.items.map((item) => `- ${item.text}`).join('\n')}`;
      }
      return `## ${section.heading}\n\n${section.markdown}`;
    })
    .join('\n\n');
  return markdownToLexical(markdown);
}

function auditLexical(value) {
  const summary = { words: 0, stars: 0, zeroWidth: 0, markdownLinks: 0, links: 0 };
  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (node.type === 'link') summary.links += 1;
    if (node.type === 'text' && typeof node.text === 'string') {
      summary.words += node.text.trim().split(/\s+/).filter(Boolean).length;
      summary.stars += (node.text.match(/\*/g) || []).length;
      summary.zeroWidth += (node.text.match(/[\u200B-\u200D\uFEFF]/g) || []).length;
      summary.markdownLinks += (node.text.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
    }
    Object.values(node).forEach(visit);
  }
  visit(value);
  return summary;
}

const blocks = sectionsForBlocks();
const fallbackBody = fullArticleLexical();
const audits = blocks
  .filter((section) => section.content)
  .map((section) => auditLexical(section.content));
const combinedAudit = audits.reduce(
  (total, audit) => {
    for (const key of Object.keys(total)) total[key] += audit[key];
    return total;
  },
  { words: 0, stars: 0, zeroWidth: 0, markdownLinks: 0, links: 0 },
);

if (combinedAudit.stars || combinedAudit.zeroWidth || combinedAudit.markdownLinks) {
  throw new Error(`Generated content failed character audit: ${JSON.stringify(combinedAudit)}`);
}

const client = new Client({
  connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
});
await client.connect();

try {
  const result = await client.query(
    `SELECT id, name, meta_title, meta_description
       FROM cms.blog_posts
      WHERE slug = $1`,
    [slug],
  );
  if (result.rowCount !== 1) {
    throw new Error(`Expected one article for ${slug}; found ${result.rowCount}`);
  }
  const post = result.rows[0];
  const alreadyCurrent =
    post.name === title &&
    post.meta_title === metaTitle &&
    post.meta_description === metaDescription;

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Article id: ${post.id}`);
  console.log(`Title: ${title}`);
  console.log(`Blocks: ${blocks.length}`);
  console.log(`FAQs: ${faqs.length}`);
  console.log(`Generated audit: ${JSON.stringify(combinedAudit)}`);

  if (!apply) {
    console.log(`Would ${alreadyCurrent ? 'refresh' : 'replace'} the current article.`);
    console.log('No database changes were made.');
    process.exit(0);
  }

  await client.query('BEGIN');
  await writePageBlocks(client, {
    collection: 'blog_posts',
    parentId: post.id,
    sections: blocks,
  });

  await client.query(
    `UPDATE cms.blog_posts
        SET name = $1,
            excerpt = $2,
            meta_title = $3,
            meta_description = $4,
            post_body = $5,
            rich_text2 = NULL,
            code_embed_code = NULL,
            updated_at = NOW()
      WHERE id = $6`,
    [title, excerpt, metaTitle, metaDescription, fallbackBody, post.id],
  );

  await client.query(
    `UPDATE cms._blog_posts_v
        SET version_name = $1,
            version_excerpt = $2,
            version_meta_title = $3,
            version_meta_description = $4,
            version_post_body = $5,
            version_rich_text2 = NULL,
            version_code_embed_code = NULL,
            version_updated_at = NOW(),
            updated_at = NOW()
      WHERE parent_id = $6 AND latest = true`,
    [title, excerpt, metaTitle, metaDescription, fallbackBody, post.id],
  );

  await client.query(
    'DELETE FROM cms.blog_posts_structured_faqs WHERE _parent_id = $1',
    [post.id],
  );
  for (let index = 0; index < faqs.length; index += 1) {
    const faq = faqs[index];
    await client.query(
      `INSERT INTO cms.blog_posts_structured_faqs
         (id, _parent_id, _order, question, answer)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), post.id, index + 1, faq.question, faq.answer],
    );
  }

  await client.query('COMMIT');
  console.log('Rewrite applied successfully.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
