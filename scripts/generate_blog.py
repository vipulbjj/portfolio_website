import os
import json
import datetime
import urllib.request
import urllib.error

# We will use OpenAI's API via raw HTTP request to avoid external pip dependencies
# if we want this to be extremely lightweight, but standard pip install openai is fine too.
# For robust github actions, we usually just install openai in the workflow.

def generate_blog_content():
    try:
        from openai import OpenAI
    except ImportError:
        print("Please install openai: pip install openai")
        exit(1)
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        exit(1)

    client = OpenAI(api_key=api_key)

    week_num = datetime.date.today().isocalendar()[1]
    use_english_couplet = week_num % 2 == 0
    print(
        f"Closing form this week: {'English couplet' if use_english_couplet else 'Roman Hindi sher'}"
    )
    if use_english_couplet:
        closing_label = "English rhyming couplet"
        closing_rules = """
    - Closing rules (English couplet, strict):
      - 2 to 4 lines inside <i> tags with <br> line breaks.
      - Clear rhyme when read aloud: line 1 rhymes with line 2; if 4 lines, line 3 rhymes with line 4 (AABB or AA couplets).
      - Plain spoken English, not poetry-speak or archaic words.
      - Must restate the essay's specific theme (model, chart, guess, ship, etc.), not generic wisdom about time or wind.
      - No forced puns or greeting-card sentiment."""
        system_closing = (
            "Closing must be an English rhyming couplet (2-4 lines) that echoes the essay theme."
        )
    else:
        closing_label = "Roman Hindi Shero-Shayari"
        closing_rules = """
    - Closing rules (Roman Hindi sher, strict):
      - 2 to 4 lines inside <i> tags with <br> line breaks.
      - Use proper Hindi/Urdu sher rhyme (qafia): line 1 rhymes with line 2; line 3 rhymes with line 4 (same ending sound).
      - Rhyme must be audible when read aloud in Hindi, not approximate English spelling rhyme.
      - Must restate the essay's specific theme in a deep, mature, and logically sensible way.
      - Keep words simple and spoken, not archaic Urdu. No Hinglish joke rhyme. No 'AI slop'.
      - CRITICAL: The couplet MUST be highly mature, make logical sense, and rhyme perfectly. If you cannot guarantee a high-quality Hindi/Urdu couplet that meets these criteria, you MUST fall back to generating an English rhyming couplet instead."""
        system_closing = (
            "Closing must be Roman Hindi sher with clear couplet rhyme (qafia) and must echo the essay theme."
        )

    prompt = f"""
    Write a weekly musing for Vipul Bajaj's personal site. He is a former Senior Quant at Alphagrep (HFT, China commodity markets), IIT Kanpur alum, published at BMVC and ICASSP, now building cognition tools and side products.

    Voice rules (strict):
    - Sound like a real person writing on a Sunday, not a manifesto or LinkedIn post.
    - Ground the piece in something concrete: a moment at work, a backtest, a product decision, a conversation, a mistake, a small observation.
    - Use plain words. Short sentences mixed with longer ones. First person is fine.
    - Be thoughtful and slightly contrarian, but humble. No preaching.
    - Do NOT use: em dashes, "delve", "tapestry", "paradox of", "inherent(ly)", "true wisdom", "grand", "illuminate", "landscape", "navigate", "it's worth noting", title patterns like "The Illusion of X".
    - Max 180 words in the body (excluding the closing couplet).
    - End with a {closing_label}.
    {closing_rules}
    - Write the essay first, then craft the closing lines so they echo its central image.

    Topic: pick one angle from life, psychology, markets, algorithms, building products, longevity or healthspan, or futuristic frames (personal agents, agentic systems, human-machine cognition). Rotate topics; do not write only about markets. Make it specific to someone who has actually traded, researched, and shipped software.

    Output STRICTLY as JSON, no markdown wrapper:
    {{
        "title": "plain, specific title (not clickbait)",
        "content": "HTML body with <br><br> between paragraphs, then closing lines in <i> that match the body theme",
        "tags": ["Tag1", "Tag2"]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You write short, grounded essays for a quant researcher turned founder. {system_closing}"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        raw_output = response.choices[0].message.content.strip()
        
        # Clean up markdown code blocks if the LLM wrapped it
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()
            
        return json.loads(raw_output)

    except Exception as e:
        print(f"Failed to generate blog content: {e}")
        exit(1)




def main():
    blog_file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'blogs.json')
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(blog_file_path), exist_ok=True)

    # Load existing blogs
    if os.path.exists(blog_file_path):
        with open(blog_file_path, 'r', encoding='utf-8') as f:
            try:
                blogs = json.load(f)
            except json.JSONDecodeError:
                blogs = []
    else:
        blogs = []



    # Generate new blog
    print("Generating new blog post...")
    new_blog_data = generate_blog_content()

    today = datetime.date.today()
    # Construct blog object
    new_blog = {
        "id": str(int(blogs[0]["id"]) + 1 if blogs else 1),
        "dateISO": today.strftime("%Y-%m-%d"),
        "date": today.strftime("%B %d, %Y"),
        "title": new_blog_data.get("title", "Untitled Musings"),
        "content": new_blog_data.get("content", "Error parsing content."),
        "tags": new_blog_data.get("tags", ["Philosophy"])
    }

    # Prepend the new blog to the list
    blogs.insert(0, new_blog)

    # Write back to file
    with open(blog_file_path, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully added new blog: {new_blog['title']}")

if __name__ == "__main__":
    main()
