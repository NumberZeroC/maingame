#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG_DIR = path.join(__dirname, '../../config')
const AI_PROVIDERS_FILE = path.join(CONFIG_DIR, 'ai-providers.json')
const CODINGPLAN_FILE = path.join(CONFIG_DIR, 'codingplan.json')

interface ModelConfig {
  id: string
  name: string
  maxTokens: number
  thinking?: { type: string; budgetTokens: number } | false
  pricing: { input: number; output: number; unit: string }
}

interface ProviderConfig {
  name: string
  apiKey: string
  baseUrl: string
  models: ModelConfig[]
}

interface AIProvidersConfig {
  currentProvider: string
  currentModel: string
  providers: Record<string, ProviderConfig>
}

interface CodingPlanConfig {
  enabled: boolean
  currentModel: string
  apiKey: string
  baseUrl: string
  models: ModelConfig[]
}

function loadAIProviders(): AIProvidersConfig | null {
  if (!fs.existsSync(AI_PROVIDERS_FILE)) {
    return null
  }
  return JSON.parse(fs.readFileSync(AI_PROVIDERS_FILE, 'utf-8'))
}

function loadCodingPlan(): CodingPlanConfig | null {
  if (!fs.existsSync(CODINGPLAN_FILE)) {
    return null
  }
  return JSON.parse(fs.readFileSync(CODINGPLAN_FILE, 'utf-8'))
}

function saveAIProviders(config: AIProvidersConfig): void {
  fs.writeFileSync(AI_PROVIDERS_FILE, JSON.stringify(config, null, 2))
}

function saveCodingPlan(config: CodingPlanConfig): void {
  fs.writeFileSync(CODINGPLAN_FILE, JSON.stringify(config, null, 2))
}

const program = new Command().name('ai-cli').description('AI模型配置管理工具').version('1.0.0')

program
  .command('list')
  .description('列出所有可用的AI模型')
  .option('-t, --type <type>', '配置类型: providers | codingplan | all', 'all')
  .action((options) => {
    console.log(chalk.bold.blue('\n🤖 AI模型配置列表\n'))

    if (options.type === 'all' || options.type === 'codingplan') {
      const codingplan = loadCodingPlan()
      if (codingplan && codingplan.enabled) {
        console.log(chalk.bold.green('📡 CodingPlan (Anthropic协议)'))
        console.log(chalk.gray(`   BaseURL: ${codingplan.baseUrl}`))
        console.log(chalk.gray(`   当前模型: ${chalk.yellow(codingplan.currentModel)}`))
        console.log(chalk.gray('   可用模型:'))
        codingplan.models.forEach((model: any) => {
          const current = model.id === codingplan.currentModel ? chalk.green('✓') : ' '
          const thinking = model.thinking ? chalk.blue('[thinking]') : ''
          console.log(`     ${current} ${model.id} - ${model.name} ${thinking}`)
        })
        console.log()
      }
    }

    if (options.type === 'all' || options.type === 'providers') {
      const providers = loadAIProviders()
      if (providers) {
        console.log(chalk.bold.green('🔌 独立大模型提供商'))
        Object.entries(providers.providers).forEach(([key, provider]: [string, any]) => {
          const currentP = providers.currentProvider === key ? chalk.green('✓') : ' '
          const hasKey = provider.apiKey ? chalk.green('🔑') : chalk.red('⚠️ 未配置')
          console.log(`  ${currentP} ${chalk.bold(key)} - ${provider.name} ${hasKey}`)
          provider.models.forEach((model: any) => {
            const currentM =
              providers.currentProvider === key && providers.currentModel === model.id
                ? chalk.green('✓✓')
                : '  '
            console.log(`     ${currentM} ${model.id} - ${model.name}`)
          })
        })
        console.log()
      }
    }
  })

program
  .command('current')
  .description('显示当前使用的AI模型')
  .action(() => {
    const codingplan = loadCodingPlan()
    const providers = loadAIProviders()

    console.log(chalk.bold.blue('\n📍 当前AI模型配置\n'))

    if (codingplan?.enabled) {
      console.log(chalk.green('CodingPlan模式:'))
      console.log(`  模型: ${chalk.yellow(codingplan.currentModel)}`)
      const model = codingplan.models.find((m: any) => m.id === codingplan.currentModel)
      if (model) {
        console.log(`  名称: ${model.name}`)
        console.log(`  最大tokens: ${model.maxTokens}`)
      }
    } else {
      console.log(chalk.gray('CodingPlan: 未启用'))
    }

    if (providers) {
      console.log(chalk.green('\n独立提供商模式:'))
      console.log(`  提供商: ${chalk.yellow(providers.currentProvider)}`)
      console.log(`  模型: ${chalk.yellow(providers.currentModel)}`)
    }
    console.log()
  })

program
  .command('switch <mode>')
  .description('切换AI模式: codingplan | providers')
  .action((mode) => {
    if (mode !== 'codingplan' && mode !== 'providers') {
      console.log(chalk.red('❌ 无效模式，请使用: codingplan 或 providers'))
      return
    }

    const codingplan = loadCodingPlan()
    if (codingplan) {
      codingplan.enabled = mode === 'codingplan'
      saveCodingPlan(codingplan)
      console.log(chalk.green(`✓ 已切换到 ${mode} 模式`))
    }
  })

program
  .command('use <modelId>')
  .description('切换当前使用的模型')
  .option('-p, --provider <provider>', '提供商名称（独立模式）')
  .action((modelId, options) => {
    const codingplan = loadCodingPlan()
    const providers = loadAIProviders()

    if (codingplan?.enabled) {
      const model = codingplan.models.find((m: any) => m.id === modelId)
      if (model) {
        codingplan.currentModel = modelId
        saveCodingPlan(codingplan)
        console.log(chalk.green(`✓ CodingPlan模型已切换到: ${modelId} (${model.name})`))
      } else {
        console.log(chalk.red(`❌ 未找到模型: ${modelId}`))
        console.log(chalk.gray('可用模型:'))
        codingplan.models.forEach((m: any) => console.log(`  - ${m.id}`))
      }
    } else if (providers) {
      if (options.provider) {
        const provider = providers.providers[options.provider]
        if (!provider) {
          console.log(chalk.red(`❌ 未找到提供商: ${options.provider}`))
          return
        }
        const model = provider.models.find((m: any) => m.id === modelId)
        if (model) {
          providers.currentProvider = options.provider
          providers.currentModel = modelId
          saveAIProviders(providers)
          console.log(chalk.green(`✓ 已切换到: ${options.provider}/${modelId} (${model.name})`))
        } else {
          console.log(chalk.red(`❌ ${options.provider} 未找到模型: ${modelId}`))
        }
      } else {
        const provider = providers.providers[providers.currentProvider]
        const model = provider?.models.find((m: any) => m.id === modelId)
        if (model) {
          providers.currentModel = modelId
          saveAIProviders(providers)
          console.log(chalk.green(`✓ 模型已切换到: ${modelId} (${model.name})`))
        } else {
          console.log(chalk.red(`❌ 当前提供商未找到模型: ${modelId}`))
        }
      }
    }
  })

program
  .command('set-key <provider>')
  .description('设置提供商API密钥')
  .argument('<apiKey>', 'API密钥')
  .action((provider: string, apiKey: string) => {
    const providers = loadAIProviders()
    if (!providers) {
      console.log(chalk.red('❌ 配置文件不存在'))
      return
    }

    if (provider === 'codingplan') {
      const codingplan = loadCodingPlan()
      if (codingplan) {
        codingplan.apiKey = apiKey
        saveCodingPlan(codingplan)
        console.log(chalk.green(`✓ CodingPlan API密钥已设置`))
      }
    } else if (providers.providers[provider]) {
      providers.providers[provider].apiKey = apiKey
      saveAIProviders(providers)
      console.log(chalk.green(`✓ ${provider} API密钥已设置`))
    } else {
      console.log(chalk.red(`❌ 未找到提供商: ${provider}`))
      console.log(chalk.gray('可用提供商:'))
      Object.keys(providers.providers).forEach((p) => console.log(`  - ${p}`))
      console.log(`  - codingplan`)
    }
  })

program
  .command('add-model <provider>')
  .description('添加新模型到提供商')
  .requiredOption('-i, --id <id>', '模型ID')
  .requiredOption('-n, --name <name>', '模型名称')
  .option('-m, --max-tokens <tokens>', '最大tokens', '4096')
  .action((provider: string, options: { id: string; name: string; maxTokens: string }) => {
    if (provider === 'codingplan') {
      const codingplan = loadCodingPlan()
      if (codingplan) {
        const exists = codingplan.models.find((m: any) => m.id === options.id)
        if (exists) {
          console.log(chalk.red(`❌ 模型已存在: ${options.id}`))
          return
        }
        codingplan.models.push({
          id: options.id,
          name: options.name,
          maxTokens: parseInt(options.maxTokens),
          thinking: false,
          pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
        })
        saveCodingPlan(codingplan)
        console.log(chalk.green(`✓ 已添加模型: ${options.id}`))
      }
    } else {
      const providers = loadAIProviders()
      if (providers?.providers[provider]) {
        const exists = providers.providers[provider].models.find((m: any) => m.id === options.id)
        if (exists) {
          console.log(chalk.red(`❌ 模型已存在: ${options.id}`))
          return
        }
        providers.providers[provider].models.push({
          id: options.id,
          name: options.name,
          maxTokens: parseInt(options.maxTokens),
          pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
        })
        saveAIProviders(providers)
        console.log(chalk.green(`✓ 已添加模型到 ${provider}: ${options.id}`))
      } else {
        console.log(chalk.red(`❌ 未找到提供商: ${provider}`))
      }
    }
  })

program
  .command('add-provider <id>')
  .description('添加新提供商')
  .requiredOption('-n, --name <name>', '提供商名称')
  .option('-u, --baseUrl <url>', 'API Base URL')
  .action((id: string, options: { name: string; baseUrl: string }) => {
    const providers = loadAIProviders()
    if (!providers) {
      console.log(chalk.red('❌ 配置文件不存在'))
      return
    }

    if (providers.providers[id]) {
      console.log(chalk.red(`❌ 提供商已存在: ${id}`))
      return
    }

    providers.providers[id] = {
      name: options.name,
      apiKey: '',
      baseUrl: options.baseUrl || '',
      models: [],
    }
    saveAIProviders(providers)
    console.log(chalk.green(`✓ 已添加提供商: ${id} (${options.name})`))
  })

program
  .command('config')
  .description('显示完整配置')
  .action(() => {
    console.log(chalk.bold.blue('\n📋 AI配置详情\n'))

    const codingplan = loadCodingPlan()
    if (codingplan) {
      console.log(chalk.bold.green('CodingPlan配置:'))
      console.log(JSON.stringify(codingplan, null, 2))
      console.log()
    }

    const providers = loadAIProviders()
    if (providers) {
      console.log(chalk.bold.green('独立提供商配置:'))
      console.log(JSON.stringify(providers, null, 2))
    }
  })

program.parse(process.argv)
