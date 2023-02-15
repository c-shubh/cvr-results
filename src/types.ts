export interface MinimalResult {
  rollNo: string;
  name: string;
  sgpa: string;
  cgpa: string;
}

export interface Config {
  readonly url: string;
  readonly rollNoPrefix: string;
  readonly rollNoStart: string;
  readonly resultCount: number;
}
