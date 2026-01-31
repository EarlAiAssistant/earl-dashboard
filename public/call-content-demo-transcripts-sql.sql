-- Demo Transcripts for Call-Content Database
-- Run this in Supabase SQL Editor for call-content project

-- Create demo_transcripts table
CREATE TABLE IF NOT EXISTS demo_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  transcript_text TEXT NOT NULL,
  word_count INTEGER,
  duration_minutes INTEGER,
  industry TEXT,
  use_cases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Demo #1: SaaS User Interview (Pricing Objections)
INSERT INTO demo_transcripts (title, category, transcript_text, word_count, duration_minutes, industry, use_cases) VALUES (
  'SaaS User Interview - Pricing Objections',
  'Customer Success',
  'PM (Sarah): Hey Marcus, thanks so much for taking the time to chat today. I know you canceled your subscription last month, and I'm hoping to understand what happened so we can improve.

Marcus: Yeah, of course. Happy to help. Look, I really liked the product—your analytics dashboard is probably the best I've used. But honestly, the pricing just didn't make sense for us.

PM: Tell me more about that. Was it too expensive overall, or...?

Marcus: It's not that it was expensive per se—it's that the jump from the $99 plan to the $249 plan felt huge. We outgrew the $99 tier in like two months because you cap it at 10,000 events. But we weren't ready to spend $249 for 100,000 events when we only needed maybe 25,000.

PM: Ah, so you needed something in the middle?

Marcus: Exactly. Like, if there was a $149 plan with 30,000 or 40,000 events, we would've upgraded immediately. Instead, we just felt stuck. We tried to optimize our event tracking to stay under 10,000, but that defeated the whole purpose of using your tool.

PM: That's really helpful. Did you consider the annual plan? That brings the $249 plan down to about $200/month.

Marcus: We did look at it, but we're a 12-person startup. Dropping $2,400 upfront when we weren't even sure the ROI would justify it felt risky. Monthly pricing gives us flexibility—if something's not working, we can cancel without eating a huge loss.

PM: Makes sense. So if we had a middle tier at $149/month with, say, 35,000 events—would that have kept you as a customer?

Marcus: 100%. And honestly, I think a lot of other teams are in the same boat. When I posted in the Slack community about this, like five other people said they hit the same wall. You're probably leaving money on the table.

PM: Interesting. What about the features themselves—was there anything missing that made you feel like the $249 plan wasn't worth it?

Marcus: Not really. The features were great. I think it was purely the pricing structure. Oh, and one more thing—your competitor, ChartBeat, lets you roll over unused events to the next month. So if you have a slow month, you don't lose those events. That felt more fair.

PM: Got it. So usage rollover would've sweetened the deal?

Marcus: For sure. Especially for us—our traffic is seasonal. We spike in Q4 but are pretty quiet in Q1 and Q2. Paying for 100,000 events year-round when we only need them 3 months out of the year felt wasteful.

PM: This is gold, Marcus. Last question: if we fixed these things—added a middle tier, offered rollover, maybe a quarterly payment option—would you come back?

Marcus: Honestly? Yeah. We're using your competitor now, but we're not thrilled with their UI. If you sent me an email in a month saying you'd added a $149 tier with rollover, I'd probably switch back.

PM: Amazing. I really appreciate this feedback. I'm going to bring it to the team this week.

Marcus: No problem. Good luck—I'm rooting for you guys.',
  1200,
  8,
  'SaaS',
  ARRAY['case_study', 'pricing_page_faq', 'objection_handling', 'product_roadmap', 'blog_post']
);

-- Insert Demo #2: Consultant Client Success Call
INSERT INTO demo_transcripts (title, category, transcript_text, word_count, duration_minutes, industry, use_cases) VALUES (
  'Marketing Consultant - Client Success Debrief',
  'Client Success',
  'Consultant (Jamie): Alright Rebecca, we're at the six-month mark, and I wanted to do a quick retro. How are you feeling about everything?

Rebecca: Honestly, Jamie, this has been one of the best investments we've made. When we started, our website traffic was like 2,000 visitors a month. We're at 18,000 now.

Jamie: That's incredible! And conversion rate—last I checked, you were at 1.2%. Where are you now?

Rebecca: 3.4%. We went from 24 leads a month to over 600. Our sales team is actually complaining they can't keep up, which is a good problem to have.

Jamie: Ha! I love it. What do you think made the biggest difference?

Rebecca: Two things. First, the content strategy you built. We were blogging randomly before—like, "5 Tips for Better Productivity"—super generic. You helped us focus on bottom-of-funnel content targeting high-intent keywords. That alone tripled our organic traffic.

Jamie: And second?

Rebecca: The email nurture sequence. We had a list of 5,000 people just sitting there. You built that 7-email onboarding series, and now 40% of our trials are coming from email instead of us manually following up. It's like having a salesperson working 24/7.

Jamie: That's awesome. What about the SEO side—did the backlink outreach pay off?

Rebecca: Big time. We went from a Domain Authority of 18 to 34. That comparison guide you wrote—"Acme vs. Competitor A vs. Competitor B"—is ranking #3 for our main keyword. That one post alone brings in 200 visitors a day.

Jamie: I'm so glad that worked. Some clients are nervous about mentioning competitors, but that post is a trust-builder. People are comparing you anyway; you might as well control the narrative.

Rebecca: Exactly. And the best part? It's converting at like 8%, which is double our site average. People who read that are ready to buy.

Jamie: Love it. So what's next? Are you thinking about renewals, or do you want to shift focus?

Rebecca: Definitely renewing. But I think we've nailed the top-of-funnel stuff. I'd love to shift toward retention—like, how do we keep customers longer? Our churn is at 6% per month, and I feel like we could cut that in half with better onboarding content.

Jamie: 100%. I've been thinking about that too. We could build an in-app email series, create video tutorials, maybe a customer success playbook. Let me draft a proposal for Phase 2.

Rebecca: Perfect. And Jamie—seriously, thank you. I've worked with three other agencies before this, and you're the only one who actually delivered results instead of just reports.

Jamie: That means a lot. You've been a great partner—super responsive, trusted the process, gave us the data we needed. That's half the battle.

Rebecca: Well, I'm telling everyone about you. I already referred you to two other founders in my network.

Jamie: You're the best. Let's keep this momentum going.',
  1500,
  10,
  'Consulting',
  ARRAY['case_study', 'testimonial', 'linkedin_post', 'email_campaign', 'website_copy']
);

-- Insert Demo #3: Agency Discovery Call
INSERT INTO demo_transcripts (title, category, transcript_text, word_count, duration_minutes, industry, use_cases) VALUES (
  'Digital Agency Discovery Call - Website Redesign',
  'Sales',
  'Agency (Tom): Hey Lisa, thanks for hopping on. I know you filled out our contact form about a website redesign. Tell me what's going on—what's driving this?

Lisa: Yeah, so our website is from like 2018, and it just feels...dated. We're embarrassed to send people there. Our bounce rate is 68%, and our CEO keeps saying we're losing deals because the site doesn't reflect the quality of our product.

Tom: Gotcha. What does your product do, just so I have context?

Lisa: We're a B2B cybersecurity platform. We help mid-market companies automate threat detection. Our average deal size is $50k, so when a prospect lands on our site and it looks like a WordPress template from 2015, it kills trust.

Tom: That makes total sense. And you mentioned bounce rate—are people leaving the homepage, or is it deeper in the funnel?

Lisa: Mostly homepage. We looked at Hotjar recordings, and people scroll like halfway down, then just leave. We think the messaging is confusing. We tried to explain everything we do, and it ended up being this wall of jargon.

Tom: Classic problem. People overcomplicate the homepage. You've got about 5 seconds to answer three questions: What do you do? Who is it for? Why should I care? If you can't do that above the fold, you've lost them.

Lisa: Exactly. That's what I keep telling our team. So what's your process for a redesign?

Tom: We start with a messaging workshop—usually a half-day session with your team. We clarify your value prop, figure out your ideal customer, map out the buyer journey. From there, we design wireframes, write copy, and build it out. The whole thing takes about 8-10 weeks.

Lisa: And what's the investment?

Tom: For a site like yours—probably 10-15 pages, some custom integrations, blog setup—we're looking at $35k to $50k depending on scope. That includes strategy, design, development, and one month of post-launch support.

Lisa: Okay. We were quoted $18k by another agency. What's the difference?

Tom: Fair question. Here's the thing: most agencies just design pretty pages. They don't touch messaging, they don't think about conversion rate, they don't care if it actually drives leads. We're in it for results. If your bounce rate doesn't drop by at least 30% and your conversion rate doesn't double, we'll keep iterating until it does.

Lisa: Wait, you guarantee results?

Tom: We don't guarantee exact numbers—too many variables outside our control. But we guarantee we won't walk away until the site is performing better than before. That's in the contract.

Lisa: Interesting. The other agency didn't mention anything like that.

Tom: Most don't. They build it, hand you the keys, and move on. We treat it like a partnership. That said, we're not the cheapest. If budget is the main factor, we might not be the best fit.

Lisa: No, I get it. Cheap usually means we'll be back here in a year doing this again. What do you need from us to move forward?

Tom: I'd need three things. First, access to your analytics—Google Analytics, Hotjar, whatever you've got. Second, a kickoff meeting with your CEO or whoever owns the final decision. Third, some reference customers or testimonials we can interview to understand what messaging resonates.

Lisa: We can do that. What's the timeline?

Tom: If we start in two weeks, you'd have a new site live by mid-April. We'd do the messaging workshop Week 1, wireframes Week 2-3, design Week 4-5, development Week 6-8, then testing and launch Week 9-10.

Lisa: Perfect. Let me loop in our CEO and get back to you by Friday.

Tom: Sounds good. I'll send over a proposal with pricing, timeline, and deliverables. One last thing—do you have a CMS preference? WordPress, Webflow, custom?

Lisa: We're on HubSpot for CRM, so if we can integrate with that, great. Otherwise, we're flexible.

Tom: HubSpot CMS is solid for B2B. We can build it there and integrate with your existing workflows. I'll include that in the proposal.

Lisa: Awesome. Thanks, Tom.

Tom: Anytime. Talk soon.',
  1800,
  12,
  'Agency',
  ARRAY['sales_script', 'proposal_template', 'objection_handling', 'blog_post', 'case_study_structure']
);

-- Insert Demo #4: Coach Strategy Session
INSERT INTO demo_transcripts (title, category, transcript_text, word_count, duration_minutes, industry, use_cases) VALUES (
  'Business Coach - Scaling Strategy Session',
  'Coaching',
  'Coach (David): Alright Samantha, let's dig into this. You said you're stuck at $15k per month and can't seem to break through. Walk me through your current client setup.

Samantha: Sure. I have eight clients, all one-on-one coaching. I charge $2k per month for weekly calls, so that's $16k. But I'm maxed out—I can't take on more than eight without burning out.

David: And you want to scale to $50k per month, right?

Samantha: Yeah, but I don't see how without cloning myself. I've thought about raising prices, but I'm worried I'll lose clients.

David: Okay, let's break this down. First, one-to-one coaching will always cap your income. You're trading time for money, and you only have so many hours. If you want to scale past $20k, you need leverage.

Samantha: Like group coaching?

David: That's one option. But let's think bigger. What if you kept your one-on-one clients at $2k—maybe even raised it to $3k for new clients—and added a group program at $500/month? You could have 20 people in the group, and that's $10k in recurring revenue with one call per week.

Samantha: Hmm. Would people pay $500 for group coaching?

David: If you position it right, absolutely. You're not selling group coaching—you're selling a community, access to you, and a proven framework. Think about it: people are paying $2k for your one-on-one time. They'd pay $500 to be in the room with seven other people learning the same framework.

Samantha: That makes sense. What would the structure look like?

David: Weekly 90-minute group calls. You teach for 30 minutes, then hot-seat coaching for the other 60. Everyone submits questions beforehand, and you pick the most relevant ones. You also create a private Slack or Circle community where they can support each other between calls.

Samantha: Okay, I like that. But how do I get 20 people to join?

David: You already have proof of concept—your eight one-on-one clients. Some of them might want to stay one-on-one, but I bet a few would move to the group if it was cheaper and they still got value. That's your seed group. Then you launch publicly with a waitlist, run a webinar, and enroll the next cohort.

Samantha: What about a course? I've been thinking about that too.

David: Courses are great for passive income, but they're not as lucrative as people think unless you have a big audience. You'd need to sell like 200 courses at $500 each to hit $100k. And the conversion rate on courses is brutal—like 1-2% without a massive funnel.

Samantha: So you're saying group coaching first, then maybe a course later?

David: Exactly. Build the group program, get it to 20-30 people, and *then* turn it into a course. You'll have testimonials, proven frameworks, and real results. That makes the course way easier to sell.

Samantha: Okay, this is clicking. So if I keep my eight one-on-one clients at $2k, that's $16k. Add a group program with 20 people at $500, that's another $10k. I'm at $26k.

David: Now you're thinking. And here's the kicker: you could run two group cohorts—one on Tuesdays, one on Thursdays. That's 40 people total, so $20k from group plus $16k from one-on-one. You just hit $36k per month without adding more one-on-one clients.

Samantha: Holy crap. And I'd only be doing like 10 hours of calls per week instead of 16.

David: Bingo. You're reclaiming time while making more money. That's leverage.

Samantha: Alright, I'm sold. What's my next step?

David: Build the group program outline this week. I'll send you a template. Then record a 60-minute webinar pitching it. We'll run the webinar live twice next month and aim to enroll your first 10-15 people. Once that's profitable, we scale.

Samantha: Let's do it.',
  1400,
  9,
  'Coaching',
  ARRAY['course_content', 'lead_magnet', 'email_series', 'social_posts', 'blog_post']
);

-- Insert Demo #5: Product Team Customer Feedback
INSERT INTO demo_transcripts (title, category, transcript_text, word_count, duration_minutes, industry, use_cases) VALUES (
  'Product Manager - Power User Feature Feedback',
  'Product Feedback',
  'PM (Rachel): Hey Brian, thanks for joining. I know you're one of our most active users—you've logged like 300 hours in the app over the past six months.

Brian: Ha, yeah. I basically live in your tool. It's replaced like three other apps for us.

Rachel: That's amazing. So I wanted to pick your brain about what's working, what's not, and what you wish we'd build next.

Brian: Sure. Where do you want to start?

Rachel: Let's start with pain points. What's frustrating you right now?

Brian: Honestly, the biggest thing is bulk actions. Like, I have 200 tasks in my backlog, and if I want to change the priority on all of them, I have to click each one individually. It takes forever.

Rachel: Noted. So bulk edit would save you a ton of time?

Brian: Huge. Even just basic stuff—bulk archive, bulk assign to a team member, bulk move to a different project. Right now, it's super manual.

Rachel: Got it. What else?

Brian: The search function is pretty weak. I'll search for a keyword, and it only shows results from task titles—not descriptions or comments. So if I'm looking for something a teammate mentioned three weeks ago, I basically have to scroll through everything.

Rachel: So you'd want full-text search across all fields?

Brian: Yeah, exactly. And maybe filters too—like, "Show me all tasks where Sarah commented in the last 30 days." That would be a game-changer.

Rachel: Love that. What about features you'd want us to build from scratch?

Brian: Ooh, okay. I've got a wishlist. Number one: time tracking. We use Toggl right now, and it's fine, but if I could start a timer directly in your app and have it auto-log to tasks, that would be seamless.

Rachel: Interesting. Would you switch from Toggl if we built that?

Brian: 100%. We're only using it because your app doesn't have it. If you added time tracking, we'd drop Toggl tomorrow and save $15/user/month.

Rachel: Good to know. What else?

Brian: Integrations. You guys have Slack and Google Calendar, which is great. But we use Notion for docs and Airtable for our CRM. If I could push tasks to Notion or sync contacts from Airtable, that would connect our whole workflow.

Rachel: We've been hearing that a lot. Zapier integration is on the roadmap—would that solve it?

Brian: Oh, 100%. Zapier would be perfect. When's that launching?

Rachel: Probably Q2. We're finalizing the API docs now.

Brian: Nice. Okay, last thing: mobile app. Your web app is great, but the mobile version is clunky. I can't drag and drop tasks, and the UI feels like a shrunk-down version of desktop instead of being built for mobile.

Rachel: Yeah, mobile is tough. We've been debating whether to rebuild it from scratch or just keep iterating. If we rebuilt it, what would you want?

Brian: Offline mode, for sure. I travel a lot, and if I'm on a plane, I can't do anything in the app. Let me work offline and sync when I reconnect. Also, better notifications—right now I get like 50 emails a day. Let me customize what I get notified about.

Rachel: Super helpful. Last question: if you could only pick one feature to ship next, what would it be?

Brian: Bulk actions, hands down. That's a daily pain point. The others are nice-to-haves, but bulk edit would save me hours every week.

Rachel: Perfect. I'll bring this back to the team. Thanks so much, Brian.

Brian: Anytime. Keep building—you guys are crushing it.',
  1300,
  8,
  'SaaS',
  ARRAY['product_roadmap', 'feature_announcement', 'testimonial', 'user_survey_template', 'social_proof']
);

-- Create indexes for better performance
CREATE INDEX idx_demo_category ON demo_transcripts(category);
CREATE INDEX idx_demo_industry ON demo_transcripts(industry);

-- Grant access (adjust based on your RLS policies)
-- ALTER TABLE demo_transcripts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Demo transcripts are viewable by all authenticated users" ON demo_transcripts FOR SELECT USING (auth.role() = 'authenticated');
