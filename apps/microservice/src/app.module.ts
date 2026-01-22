import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { NatsModule } from './nats/nats.module'
import { TasksModule } from './tasks/tasks.module'
import { CloudflareKvModule } from './cloudflare-kv/cloudflare-kv.module'
import { LoggingInterceptor } from './common'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    NatsModule,
    CloudflareKvModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
