import { Client4 } from '@mattermost/client'
import chalk from 'chalk'
import { parse } from 'yaml'
import z from 'zod'

const envSchema = z.object({
  MATTERMOST_URL: z.string(),
  MATTERMOST_TOKEN: z.string(),
  MATTERMOST_PHILOSOPHY_CHANNEL_ID: z.string(),
})

const env = envSchema.parse(process.env)

function getMattermostClient() {
  const client = new Client4()
  client.setUrl(env.MATTERMOST_URL)
  client.setToken(env.MATTERMOST_TOKEN)
  return client
}

interface Chapter {
  date: string
  title: string
  value: string
}

async function sendToMattermost(chapter: Chapter) {
  const client = getMattermostClient()
  const channel = await client.getChannel(env.MATTERMOST_PHILOSOPHY_CHANNEL_ID)
  const posts = await client.getPosts(channel.id)

  const chapterContent = chapter.value.replaceAll('\n', '\n\n')

  console.log(`${chapterContent}\n`)

  const message = `### Daily Dad for ${chapter.date}\n\n#### ${chapter.title}\n\n${chapterContent}`

  const existingPost = Object.values(posts.posts).find(
    (post) =>
      post.props['daily-dad'] === true &&
      post.props['daily-dad-date'] === chapter.date,
  )
  if (existingPost) {
    return client.patchPost({ id: existingPost.id, message })
  }

  if (!channel) {
    throw Error('Channel not found')
  }

  return client.createPost({
    channel_id: channel.id,
    message,
    props: {
      'daily-dad': true,
      'daily-dad-date': chapter.date,
    },
  } as any)
}

async function getTodayChapter(): Promise<Chapter> {
  const chapters = parse(await Bun.file(`${__dirname}/daily-dad.yaml`).text())

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })

  if (!chapters[today]) {
    throw Error('No chapter found for today.')
  }

  const todayChapter = { ...chapters[today], date: today }

  return todayChapter
}

if (import.meta.main) {
  try {
    const todayChapter = await getTodayChapter()

    await sendToMattermost(todayChapter)
    console.log(chalk.green('✅ Post for today created/updated'))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
