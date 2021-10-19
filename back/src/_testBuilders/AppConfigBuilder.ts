import { AppConfig } from "../adapters/primary/appConfig";
import { ProcessEnv } from "../shared/envHelpers";
import { Builder } from "./Builder";

const defaultConfigParams = {
  // Test-only key, do not use in production environments!
  JWT_PRIVATE_KEY:
    "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIEUlP92zWRVJTz5bxyP57npwsPCi0lh5C/uxX5ZuJn6OoAoGCCqGSM49\nAwEHoUQDQgAEF0O2Llia9pN283L4DYrVUgIQrqPduq+gkqPLDn9OoVYcbRdeKqCe\n53195KiTm0aSOw/mgml9SVt+Rs4t60Ubkw==\n-----END EC PRIVATE KEY-----",

  // Test-only key, do not use in production environments!
  JWT_PUBLIC_KEY:
    "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEF0O2Llia9pN283L4DYrVUgIQrqPd\nuq+gkqPLDn9OoVYcbRdeKqCe53195KiTm0aSOw/mgml9SVt+Rs4t60Ubkw==\n-----END PUBLIC KEY-----",

  BACKOFFICE_USERNAME: "e2e_tests",
  BACKOFFICE_PASSWORD: "e2e",
};

// See "Working with AppConfig" in back/README.md for more details.
export class AppConfigBuilder implements Builder<AppConfig> {
  public constructor(readonly configParams: ProcessEnv = defaultConfigParams) {}

  public enableViewableApplications(): AppConfigBuilder {
    return new AppConfigBuilder({
      ...this.configParams,
      ENABLE_VIEWABLE_APPLICATIONS: "TRUE",
    });
  }

  public enableGenericApplicationForm(): AppConfigBuilder {
    return new AppConfigBuilder({
      ...this.configParams,
      ENABLE_GENERIC_APPLICATION_FORM: "TRUE",
    });
  }

  public enableBoulogneSurMerApplicationForm(): AppConfigBuilder {
    return new AppConfigBuilder({
      ...this.configParams,
      ENABLE_BOULOGNE_SUR_MER_APPLICATION_FORM: "TRUE",
    });
  }

  public enableNarbonneApplicationForm(): AppConfigBuilder {
    return new AppConfigBuilder({
      ...this.configParams,
      ENABLE_NARBONNE_APPLICATION_FORM: "TRUE",
    });
  }

  public build() {
    return AppConfig.createFromEnv(/* readDotEnv= */ false, this.configParams);
  }
}