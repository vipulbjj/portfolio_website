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

    prompt = """
    You are an intellectual, highly philosophical, and slightly contrarian CEO and former Senior Quant Researcher.
    Write a short, profound blog post (max 200 words) about life, psychology, financial markets, or algorithms. 
    It should challenge a common narrative.
    It MUST include a short 'Shero-Shayari' (Urdu poetry written in English script) that perfectly encapsulates the theme.
    
    Output the response STRICTLY as a JSON object with this exact format, no markdown wrapping, just the JSON string:
    {
        "title": "A captivating, contrarian title",
        "content": "The HTML formatted content. Use <br><br> for paragraphs. Wrap the Shayari in <i> and <br> tags.",
        "tags": ["Tag1", "Tag2"]
    }
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a philosophical Quant Researcher and CEO."},
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

def blog_posted_this_week(blogs):
    """Skip generation if a post was already added in the last 7 days."""
    if not blogs:
        return False
    latest = blogs[0]
    iso = latest.get("dateISO")
    if iso:
        try:
            posted = datetime.datetime.strptime(iso, "%Y-%m-%d").date()
            return (datetime.date.today() - posted).days < 7
        except ValueError:
            pass
    return False


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

    if blog_posted_this_week(blogs):
        print("A post was already published this week. Skipping generation.")
        return

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
