
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    console.log('Sending request to Claude API with messages:', messages);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claudeApiKey}`,
        'anthropic-version': '2024-02-15-preview',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        system: "You are a helpful AI assistant that helps users with their restaurant management system. Be concise but friendly in your responses."
      }),
    });

    const data = await response.json();
    console.log('Claude API response:', data);

    if (data.error) {
      console.error('Claude API error:', data.error);
      throw new Error(data.error.message || 'Unknown error from Claude API');
    }

    // Check if we have the expected response structure
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response format from Claude API');
    }

    const responseMessage = data.content[0].text;
    console.log('Sending response message:', responseMessage);
    
    return new Response(
      JSON.stringify({ 
        message: responseMessage 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-response function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
