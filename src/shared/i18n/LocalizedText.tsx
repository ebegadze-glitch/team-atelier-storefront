import { useTranslation } from 'react-i18next'

export default function LocalizedText({ k }: { k: string }) {
  const { t } = useTranslation()
  return <>{t(k)}</>
}
