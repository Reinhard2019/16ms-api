import { defineConfig } from "@unocss/vite";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import { presetMini } from "@unocss/preset-mini";
import { presetScrollbar } from "unocss-preset-scrollbar";

export default defineConfig({
  presets: [presetMini(), presetScrollbar()],
  transformers: [transformerVariantGroup()],
});
