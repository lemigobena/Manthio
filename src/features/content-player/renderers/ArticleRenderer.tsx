import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Lesson } from '../../../types';
import { QuizEngine } from '../../../components/modules/QuizEngine';

interface ArticleRendererProps {
  lesson: Lesson;
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ lesson }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 prose prose-invert max-w-none w-full">
      <div className="flex justify-between items-start border-b border-line pb-6">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-text m-0">{lesson.title}</h2>
          <div className="text-xs text-muted flex items-center space-x-4 mt-3 font-semibold uppercase tracking-wider">
            <span>Read time: {lesson.duration}</span>
            <span>Difficulty: {lesson.difficulty || 1}/3</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm leading-relaxed text-text mt-6 space-y-6">
        <p className="text-base text-muted font-medium">
          Welcome to this comprehensive lesson. In this module, we will explore the fundamental concepts 
          in deep detail. You will learn the core mechanics, practical applications, and advanced edge cases 
          that will set you apart.
        </p>

        <h3 className="text-lg font-bold text-text mt-10 mb-4">1. Introduction to the Core Mechanics</h3>
        <p>
          To understand how complex systems operate, we must first break them down into their most basic atomic units. 
          Often, what appears to be a monolithic architecture is actually a symphony of smaller, specialized 
          components working in tandem. When we analyze these individual units, the complexity begins to fade, 
          replaced by logical predictability.
        </p>
        <p>
          Consider the analogy of a mechanical watch. On the surface, it simply tells time. But beneath the dial 
          lies an intricate network of gears, springs, and escapements. Each piece has a single, vital purpose. 
          If one gear is misaligned, the entire mechanism fails. Software engineering follows this exact paradigm.
        </p>

        <div className="my-8 rounded-xl overflow-hidden border border-line bg-[#0a0d10] p-6 text-center">
          <div className="w-full h-64 bg-panel/50 rounded-lg flex items-center justify-center border border-line/50 mb-4 overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" 
              alt="System Architecture Diagram" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            />
          </div>
          <p className="text-xs text-muted italic">Figure 1.1: The relationship between modular components.</p>
        </div>

        <h3 className="text-lg font-bold text-text mt-10 mb-4">2. Key Principles to Remember</h3>
        <ul className="list-disc pl-5 space-y-3 text-muted">
          <li><strong className="text-text">Immutability:</strong> Data should not be changed once created. Instead, create new copies with the required modifications.</li>
          <li><strong className="text-text">Separation of Concerns:</strong> Each function or module should do one thing and do it well.</li>
          <li><strong className="text-text">Idempotence:</strong> Repeating an operation should yield the same result as executing it once.</li>
          <li><strong className="text-text">Fail Fast:</strong> Systems should immediately report any failure or unexpected condition rather than attempting to continue in an unstable state.</li>
        </ul>

        <h3 className="text-lg font-bold text-text mt-10 mb-4">3. Practical Implementation</h3>
        <p>
          Let's look at how we might apply these principles in a real-world scenario. Notice how the code below 
          avoids side effects and treats inputs as immutable.
        </p>

        <pre className="bg-[#0a0d10] p-5 rounded-xl border border-line text-sm font-mono overflow-x-auto my-6 text-cyan shadow-inner">
          <code>
<span className="text-pink-500">def</span> <span className="text-blue-400">process_data_pipeline</span>(raw_data: <span className="text-yellow-300">list</span>) -&gt; <span className="text-yellow-300">list</span>:{'\n'}
{'    '}"""{'\n'}
{'    '}Pure function to process data without mutating the original input.{'\n'}
{'    '}"""{'\n'}
{'    '}<span className="text-gray-500"># 1. Filter out invalid entries</span>{'\n'}
{'    '}valid_data = [item <span className="text-pink-500">for</span> item <span className="text-pink-500">in</span> raw_data <span className="text-pink-500">if</span> is_valid(item)]{'\n'}
{'\n'}
{'    '}<span className="text-gray-500"># 2. Apply transformations</span>{'\n'}
{'    '}transformed = <span className="text-yellow-300">list</span>(<span className="text-blue-400">map</span>(transform_item, valid_data)){'\n'}
{'\n'}
{'    '}<span className="text-gray-500"># 3. Sort securely</span>{'\n'}
{'    '}result = <span className="text-blue-400">sorted</span>(transformed, key=<span className="text-pink-500">lambda</span> x: x.timestamp, reverse=<span className="text-pink-500">True</span>){'\n'}
{'\n'}
{'    '}<span className="text-pink-500">return</span> result
          </code>
        </pre>

        <p>
          As you can see, the <code className="bg-panel px-1.5 py-0.5 rounded text-cyan border border-line text-xs">process_data_pipeline</code> function 
          never alters <code className="bg-panel px-1.5 py-0.5 rounded text-cyan border border-line text-xs">raw_data</code> directly. 
          This ensures that whatever called this function doesn't experience unexpected side effects.
        </p>

        <blockquote className="border-l-4 border-cyan pl-5 py-2 my-8 bg-cyan/5 rounded-r-lg italic text-muted">
          "The most critical skill a developer can learn is not a new language or framework, but the discipline 
          to write code that the next developer can easily understand and safely modify."
        </blockquote>

        <h3 className="text-lg font-bold text-text mt-10 mb-4">4. Common Pitfalls and Edge Cases</h3>
        <p>
          Even experienced developers fall into traps when dealing with large-scale architecture. Here are the most 
          frequent issues you will encounter:
        </p>

        <div className="space-y-4 my-6">
          <div className="bg-bg border border-line p-5 rounded-xl">
            <h4 className="font-bold text-red-400 mb-2">Memory Leaks via Closures</h4>
            <p className="text-xs text-muted">Retaining references to large objects inside closures can prevent the garbage collector from reclaiming memory. Always nullify or release references when they are no longer needed.</p>
          </div>
          <div className="bg-bg border border-line p-5 rounded-xl">
            <h4 className="font-bold text-orange-400 mb-2">Race Conditions in Async Code</h4>
            <p className="text-xs text-muted">When multiple asynchronous operations read and write to the same state simultaneously, unpredictable behavior occurs. Utilize locks, semaphores, or state-machines.</p>
          </div>
        </div>

        <p>
          Understanding these pitfalls allows you to design defensively. Anticipate failure. Assume that network 
          requests will drop, that disks will fill up, and that user input will be malformed.
        </p>

        <div className="bg-cyan/10 border border-cyan/30 p-6 rounded-xl space-y-3 my-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          <div className="font-bold text-cyan flex items-center space-x-2 uppercase tracking-wider relative z-10">
            <Sparkles className="w-5 h-5" />
            <span>Key Takeaway</span>
          </div>
          <p className="text-text text-sm leading-relaxed relative z-10">
            Building robust systems is less about writing clever algorithms and more about rigorously handling 
            errors, validating boundaries, and ensuring your system's state remains predictable under heavy load.
          </p>
        </div>

        <h3 className="text-lg font-bold text-text mt-10 mb-4">5. Next Steps</h3>
        <p>
          Before moving on to the next module, make sure you complete the interactive exercise provided at the 
          end of this lesson. Experiment with the sandbox environment to see how changing input parameters 
          affects the output of our immutable pipeline.
        </p>

        <div className="mt-12 bg-panel border border-line rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-lg">
          <div className="text-center mb-6">
            <h4 className="font-bold text-lg text-text">Knowledge Check</h4>
            <p className="text-sm text-muted mt-1">Test your understanding before moving on.</p>
          </div>
          <QuizEngine />
        </div>

      </div>
    </div>
  );
};
