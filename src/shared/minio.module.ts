import {
  ConfigurableModuleBuilder,
  Module,
  type DynamicModule,
  type InjectionToken,
  type ModuleMetadata,
  type OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client, type ClientOptions } from 'minio';

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ClientOptions>({
    moduleName: 'Minio',
  })
    .setClassMethodName('forRoot')
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();

const MINIO_BUCKET: InjectionToken<string | undefined> =
  Symbol.for('MINIO_BUCKET');

@Module({})
export class MinioModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  static forRoot(params: ClientOptions) {
    const client = new Client(params);
    const module = super.forRoot(params);

    return {
      ...module,
      providers: [
        ...module.providers!,
        {
          provide: Client,
          useValue: client,
        },
      ],
      exports: [
        {
          provide: Client,
          useValue: client,
        },
      ],
    };
  }

  static forRootAsync(params: ModuleMetadata) {
    const module = super.forRootAsync(params);

    return {
      ...module,
      providers: [
        ...module.providers!,
        {
          provide: Client,
          inject: [MODULE_OPTIONS_TOKEN],
          useFactory(params: ClientOptions) {
            return new Client(params);
          },
          durable: true,
        },
      ],
      exports: [
        {
          provide: Client,
          inject: [MODULE_OPTIONS_TOKEN],
          useFactory(params: ClientOptions) {
            return new Client(params);
          },
          durable: true,
        },
      ],
    };
  }

  static forFeature(bucketName: string): DynamicModule {
    return {
      module: ConfigurableModuleClass,
      global: false,
      providers: [
        {
          provide: MINIO_BUCKET,
          useValue: bucketName,
        },
      ],
    };
  }

  async onModuleInit() {
    const client = this.moduleRef.get(Client);
    const bucketName = this.moduleRef.get(MINIO_BUCKET, { strict: false });

    if (bucketName && !(await client.bucketExists(bucketName))) {
      await client.makeBucket(bucketName);
    }
  }
}
