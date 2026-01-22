import { Module, Global } from '@nestjs/common'
import { CloudflareKvService } from './cloudflare-kv.service'
import { RetryService } from './retry.service'

@Global()
@Module({
  providers: [CloudflareKvService, RetryService],
  exports: [CloudflareKvService],
})
export class CloudflareKvModule {}
