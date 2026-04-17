"use client";

interface GenerateFormProps {
  topic: string;
  setTopic: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  authorId: string;
  setAuthorId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  authors: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; title: string }>;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function GenerateForm({
  topic,
  setTopic,
  instructions,
  setInstructions,
  authorId,
  setAuthorId,
  categoryId,
  setCategoryId,
  authors,
  categories,
  onGenerate,
  isGenerating,
}: GenerateFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Blog Generator
        </h1>
        <p className="text-gray-500 text-sm">
          Generate a complete, publish-ready article for Dialogus using AI.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
      >
        {/* Topic */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Article Topic <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. India's digital rupee adoption challenges in rural areas"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm"
          />
        </div>

        {/* Instructions */}
        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Additional Instructions{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Focus on the regulatory angle, include recent RBI data, keep it under 1000 words"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm resize-none"
          />
        </div>

        {/* Author & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author
            </label>
            <select
              id="author"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm bg-white"
            >
              <option value="">Select author</option>
              {authors.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm bg-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-4 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating article…
            </>
          ) : (
            "Generate Article"
          )}
        </button>
      </form>
    </div>
  );
}
