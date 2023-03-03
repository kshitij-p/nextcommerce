import { type ComponentType } from "react";

export type HeadlessUiProps<T> = T extends ComponentType<infer P> ? P : T;
