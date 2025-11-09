// Test component to verify Gemini AI integration
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import GeminiAgricultureService from '@/services/geminiService';

const GeminiTest: React.FC = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const geminiService = new GeminiAgricultureService();

  const testGemini = async () => {
    setLoading(true);
    try {
      const query = {
        id: 'test-1',
        userId: 'test-user',
        message: 'What are the common pests in rice cultivation in Kerala?',
        language: 'en' as const,
        location: {
          district: 'Kerala'
        },
        timestamp: new Date()
      };

      const result = await geminiService.processAgricultureQuery(query);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Gemini AI Test</h2>
      <Button onClick={testGemini} disabled={loading} className="mb-4">
        {loading ? 'Testing...' : 'Test Gemini AI'}
      </Button>
      
      {response && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Response:</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GeminiTest;
