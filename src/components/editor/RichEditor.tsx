"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useRef } from "react"

interface RichEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
}

// Preset colors for the color palette
const COLORS = [
  "#ffffff", "#cccccc", "#888888", "#ff4444", "#ff8c00",
  "#ffd700", "#00cc44", "#00ccff", "#4488ff", "#cc44ff",
  "#ff44cc", "#ff6b6b", "#51cf66", "#339af0", "#cc5de8",
  // RGB gradient
  "#ff0000", "#ff4400", "#ff8800", "#ffcc00", "#88ff00",
  "#00ff88", "#00ffff", "#0088ff", "#8800ff", "#ff00ff",
]

export default function RichEditor({ value, onChange, placeholder = "Ürün açıklaması..." }: RichEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: "code-block" } },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[200px] p-4 outline-none",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const ToolBtn = ({ icon, action, active, title }: {
    icon: string; action: () => void; active?: boolean; title?: string
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); action() }}
      className={cn(
        "flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-100",
        active
          ? "bg-white/20 text-white"
          : "text-white/40 hover:bg-white/[0.08] hover:text-white/80"
      )}
    >
      <Icon icon={icon} width={14} />
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-white/[0.08]" />

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0c0c0c] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.06] p-1.5 bg-[#090909]">

        {/* Headings */}
        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => {
            const v = e.target.value
            if (v === "p") editor.chain().focus().setParagraph().run()
            else editor.chain().focus().toggleHeading({ level: Number(v) as 1|2|3 }).run()
          }}
          className="h-7 rounded-lg bg-transparent border border-white/[0.08] text-xs text-white/50 px-1.5 cursor-pointer outline-none"
        >
          <option value="p">Normal</option>
          <option value="1">Başlık 1</option>
          <option value="2">Başlık 2</option>
          <option value="3">Başlık 3</option>
        </select>

        <Divider />

        {/* Basic formatting */}
        <ToolBtn icon="carbon:text-bold"      title="Kalın (Ctrl+B)"    action={() => editor.chain().focus().toggleBold().run()}       active={editor.isActive("bold")} />
        <ToolBtn icon="carbon:text-italic"    title="İtalik (Ctrl+I)"  action={() => editor.chain().focus().toggleItalic().run()}     active={editor.isActive("italic")} />
        <ToolBtn icon="carbon:text-strikethrough" title="Üstü çizili"   action={() => editor.chain().focus().toggleStrike().run()}     active={editor.isActive("strike")} />
        <ToolBtn icon="carbon:text-underline" title="Altı çizili"      action={() => editor.chain().focus().toggleCode().run()}       active={editor.isActive("code")} />

        <Divider />

        {/* Alignment */}
        <ToolBtn icon="carbon:align-horizontal-left"   title="Sola"    action={() => editor.chain().focus().setTextAlign("left").run()}    active={editor.isActive({ textAlign: "left" })} />
        <ToolBtn icon="carbon:align-horizontal-center" title="Orta"    action={() => editor.chain().focus().setTextAlign("center").run()}  active={editor.isActive({ textAlign: "center" })} />
        <ToolBtn icon="carbon:align-horizontal-right"  title="Sağa"    action={() => editor.chain().focus().setTextAlign("right").run()}   active={editor.isActive({ textAlign: "right" })} />

        <Divider />

        {/* Lists */}
        <ToolBtn icon="carbon:list-bulleted" title="Liste"             action={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")} />
        <ToolBtn icon="carbon:list-numbered" title="Numaralı Liste"    action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
        <ToolBtn icon="carbon:quotes"        title="Alıntı"            action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
        <ToolBtn icon="carbon:code"          title="Kod Bloğu"         action={() => editor.chain().focus().toggleCodeBlock().run()}   active={editor.isActive("codeBlock")} />

        <Divider />

        {/* Color picker */}
        <div className="relative group">
          <button
            type="button"
            title="Metin Rengi"
            onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click() }}
            className="flex items-center gap-1 h-7 px-2 rounded-lg text-white/40 hover:bg-white/[0.08] hover:text-white/80 transition-all text-xs"
          >
            <Icon icon="carbon:color-palette" width={14} />
            <span className="hidden sm:inline">Renk</span>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>

        {/* Highlight */}
        <button
          type="button"
          title="Vurgu"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: "#ffd700" }).run() }}
          className={cn(
            "flex items-center h-7 px-2 rounded-lg transition-all text-xs",
            editor.isActive("highlight")
              ? "bg-yellow-400/20 text-yellow-400"
              : "text-white/40 hover:bg-white/[0.08] hover:text-white/80"
          )}
        >
          <Icon icon="carbon:text-highlight" width={14} />
        </button>

        <Divider />

        {/* Color presets */}
        <div className="flex items-center gap-0.5 flex-wrap max-w-[140px]">
          {COLORS.slice(0, 10).map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run() }}
              className="h-4 w-4 rounded-sm border border-white/10 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Divider />

        {/* Clear format */}
        <ToolBtn icon="carbon:clean" title="Formatı Temizle" action={() => editor.chain().focus().unsetAllMarks().run()} />
        <ToolBtn icon="carbon:undo"  title="Geri Al"         action={() => editor.chain().focus().undo().run()} />
        <ToolBtn icon="carbon:redo"  title="İleri Al"        action={() => editor.chain().focus().redo().run()} />
      </div>

      {/* Editor content */}
      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p { margin: 0.4em 0; color: rgba(255,255,255,0.7); font-size: 0.875rem; line-height: 1.6; }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; color: white; margin: 0.8em 0 0.4em; }
        .ProseMirror h2 { font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.9); margin: 0.7em 0 0.35em; }
        .ProseMirror h3 { font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.85); margin: 0.6em 0 0.3em; }
        .ProseMirror code { background: rgba(255,255,255,0.08); color: #a5b4fc; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.8rem; }
        .ProseMirror pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1em; margin: 0.6em 0; overflow-x: auto; }
        .ProseMirror pre code { background: none; color: #e2e8f0; padding: 0; }
        .ProseMirror blockquote { border-left: 3px solid rgba(255,255,255,0.2); padding-left: 1em; color: rgba(255,255,255,0.45); font-style: italic; margin: 0.6em 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; color: rgba(255,255,255,0.65); }
        .ProseMirror li { margin: 0.2em 0; font-size: 0.875rem; }
        .ProseMirror mark { padding: 0.1em 0.2em; border-radius: 3px; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: rgba(255,255,255,0.2); pointer-events: none; float: left; height: 0; }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  )
}