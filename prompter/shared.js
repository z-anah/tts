// Shared functionality for Prompter application

// Supabase configuration
const SUPABASE_URL = "https://igjyzsigahdoqrcsxjrt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnanl6c2lnYWhkb3FyY3N4anJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjAyOTUsImV4cCI6MjA3NTk5NjI5NX0.8O3RlI01KdilSsKPvCGHSlFspttiFeYmWKU2-r60P7w";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Navigation utilities
const PrompterNav = {
  goToList() {
    window.location.href = 'list.html';
  },
  
  goToCreate() {
    window.location.href = 'create.html';
  },
  
  goToDetail(promptId) {
    window.location.href = `detail.html?id=${promptId}`;
  },
  
  goToEdit(promptId) {
    window.location.href = `create.html?edit=${promptId}`;
  },
  
  goToHome() {
    window.location.href = '../index.html';
  }
};

// URL parameter utilities
const URLParams = {
  get(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
  set(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState(null, null, url);
  }
};

// Supabase operations
const PrompterAPI = {
  async fetchAll() {
    const { data } = await supabaseClient
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  },
  
  async fetchById(id) {
    const { data } = await supabaseClient
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  },
  
  async create(promptData) {
    const { data } = await supabaseClient
      .from('prompts')
      .insert([promptData])
      .select()
      .single();
    return data;
  },
  
  async update(id, promptData) {
    const { data } = await supabaseClient
      .from('prompts')
      .update(promptData)
      .eq('id', id)
      .select()
      .single();
    return data;
  },
  
  async delete(id) {
    return await supabaseClient
      .from('prompts')
      .delete()
      .eq('id', id);
  }
};

// Common utility functions
const PrompterUtils = {
  renderMarkdown(text) {
    if (!text) return '';
    try {
      return marked.parse(text);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return text.replace(/\n/g, '<br>');
    }
  },
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  },
  
  formatPromptData(form) {
    return {
      title: form.title.trim(),
      task: form.task.trim(),
      persona: form.persona.trim(),
      context: form.context.trim(),
      format: form.format.trim(),
      file_type: form.file_type,
      more_context: form.more_context.trim(),
      dynamic_params: form.dynamic_params.filter(p => p.key && p.value),
      contents: form.contents.filter(c => c.text)
    };
  },
  
  generatePrompt(prompt, dynamicParamValues) {
    let generatedPrompt = '';

    // Add persona
    if (prompt.persona) {
      generatedPrompt += `Persona: \n${prompt.persona}.\n\n`;
    }

    // Add task
    if (prompt.task) {
      generatedPrompt += `Task: \n${prompt.task}\n\n`;
    }

    // Add context
    if (prompt.context) {
      generatedPrompt += `Context: \n${prompt.context}\n\n`;
    }

    // Add more context
    if (prompt.more_context) {
      generatedPrompt += `Additional Context: \n${prompt.more_context}\n\n`;
    }

    // Replace dynamic parameters in all text
    let finalPrompt = generatedPrompt;
    if (prompt.dynamic_params) {
      prompt.dynamic_params.forEach(param => {
        const value = dynamicParamValues[param.key] || param.value;
        finalPrompt = finalPrompt.replace(new RegExp(`\\{${param.key}\\}`, 'g'), value);
      });
    }

    // Add format
    if (prompt.format) {
      finalPrompt += `Format: \n${prompt.format}\n\n`;
    }

    // Add file type instruction
    if (prompt.file_type) {
      finalPrompt += `Put in ${prompt.file_type} code. And add name of the file.\n\n`;
    }

    // Add Dynamic Parameters values
    if (prompt.dynamic_params && prompt.dynamic_params.length) {
      prompt.dynamic_params.forEach(param => {
        const value = dynamicParamValues[param.key] || param.value;
        finalPrompt += `${param.key}: ${value}\n`;
      });
      finalPrompt += '\n';
    }

    return finalPrompt.trim();
  }
};

// Common header component (returns HTML string)
const createHeader = (currentView = '') => {
  return `
    <header class="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">lightbulb</span>
        <h1 class="text-xl font-semibold dark:text-white">Prompt Engineering</h1>
      </div>
      <nav class="flex gap-3">
        <button onclick="PrompterNav.goToList()" class="${getNavClass('list', currentView)}" title="List Prompts">
          <span class="material-symbols-outlined">list</span>
        </button>
        <button onclick="PrompterNav.goToCreate()" class="${getNavClass('create', currentView)}" title="Create Prompt">
          <span class="material-symbols-outlined">add</span>
        </button>
        <button onclick="PrompterNav.goToHome()" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" title="Home">
          <span class="material-symbols-outlined">home</span>
        </button>
      </nav>
    </header>
  `;
};

// Navigation class helper
const getNavClass = (view, currentView) => {
  return 'p-2 rounded ' + (currentView === view 
    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' 
    : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white');
};