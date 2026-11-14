export type Category = "仕事" | "プライベート" | "学習" | "買い物" | "その他";

export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  category: Category;
};