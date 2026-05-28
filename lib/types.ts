export interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  name: string;
  model: string;
  status: string;
  created_at: string;
}

export interface Result {
  id: string;
  experiment_id: string;
  prompt_id: string;
  response: string;
  score: number | null;
  latency_ms: number | null;
  created_at: string;
}
