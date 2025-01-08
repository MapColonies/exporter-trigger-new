import { inject, injectable } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import config from 'config';
import { Logger } from '@map-colonies/js-logger';
import { NotFoundError } from '@map-colonies/error-types';
import { SERVICES } from '../common/constants';
import { LayerInfo } from '../common/interfaces';
import { Tracer } from '@opentelemetry/api';

@injectable()
export class RasterCatalogManagerClient extends HttpClient {
  public constructor(
    @inject(SERVICES.LOGGER) protected readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer
  ) {
    super(
      logger,
      config.get<string>('externalClientsConfig.clientsUrls.rasterCatalogManager.url'),
      'RasterCatalogManager',
      config.get<IHttpRetryConfig>('externalClientsConfig.httpRetry'),
      config.get<boolean>('externalClientsConfig.disableHttpClientLogs')
    );
  }

  public async findLayer(id: string): Promise<LayerInfo> {
    const findLayerUrl = `/records/find`;
    this.logger.info(`Retrieving catalog record with id ${id}`);

    const layer = (await this.post<LayerInfo[]>(findLayerUrl, { id }))[0];

    if (!layer) {
      throw new NotFoundError(`Could not find catalog layer with id: ${id}`);
    }

    this.logger.debug(layer, `Retrieved layer with id ${id}`);
    return layer;
  }
}
