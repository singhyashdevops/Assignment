import Image from 'next/image'

interface Props {
  currentUrl: string
  onCopy: () => void
}

export default function ShareSection({ currentUrl, onCopy }: Props) {
  if (!currentUrl) return null

  const encodedUrl = encodeURIComponent(currentUrl)

  return (
    <section className="pt-2 border-t border-gray-100">
      <button
        onClick={onCopy}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold
          text-amazon-orange bg-amazon-orange/5 border border-amazon-orange/20
          rounded-lg hover:bg-amazon-orange/10 transition-colors"
      >
        Save Current View (Copy Link)
      </button>

      <p className="text-[10px] text-gray-500 mt-2 text-center">
        Click to copy a shareable link of your current filters.
      </p>

      <div className="flex gap-2 justify-center mt-3">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/twitter.png" alt="Twitter" width={20} height={20} className="w-6 h-6 hover:opacity-80" />
        </a>

        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/linkedin.png" alt="LinkedIn" width={20} height={20} className="w-6 h-6 hover:opacity-80" />
        </a>

        <a
          href={`https://api.whatsapp.com/send?text=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/whatsapp.png" alt="WhatsApp" width={20} height={20} className="w-6 h-6 hover:opacity-80" />
        </a>
      </div>
    </section>
  )
}
