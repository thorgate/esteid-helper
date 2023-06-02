import IdentificationManager from "./IdentificationManager";
import LegacyIdentificationManager from "./LegacyIdentificationManager";

import { LANGUAGE_ET, LANGUAGE_EN, LANGUAGE_RU, LANGUAGE_LT } from "./IdCardManager";

const Languages = {
    ET: LANGUAGE_ET,
    EN: LANGUAGE_EN,
    RU: LANGUAGE_RU,
    LT: LANGUAGE_LT,
};

export { IdentificationManager, LegacyIdentificationManager, Languages };

export default {
    IdentificationManager: IdentificationManager,
    LegacyIdentificationManager: LegacyIdentificationManager,

    Languages: Languages,
};
