import configparser
from os import environ
from typing import Tuple, Type, TypeVar, Optional, Dict
import logging

# env + ini + default config loader.
# could be replaced by python-dotenv, but, anyway...

ini = configparser.ConfigParser()
read_ret = ini.read('config.ini')
if len(read_ret) == 0:
    logging.warning("Failed to load config.ini file, do check working directory")

CONFIG_T = TypeVar('CONFIG_T', str, float, int, bool)


def _config_item(value_type: Type[CONFIG_T],
                 env_var: str,
                 ini_var: Tuple[str, str],
                 default: Optional[CONFIG_T]) -> Optional[CONFIG_T]:
    val = environ.get(env_var)
    if val is None and ini.has_section(ini_var[0]) and ini_var[1] in ini[ini_var[0]]:
        val = ini[ini_var[0]][ini_var[1]]
    if val is None:
        val = default
    return value_type(val)


# this static class is exported in the tragos.__init__ module so it can be imported like this : imort tragos.Config
class Config:
    BIND_ADDRESS: str = _config_item(str, "TRAGOS_BIND_ADDRESS", ("server", "bind_address"), "127.0.0.1")
    BIND_PORT: int = _config_item(int, "TRAGOS_BIND_PORT", ("server", "bind_port"), 8080)
    FLASK_DEBUG: bool = _config_item(bool, "TRAGOS_FLASK_DEBUG", ("server", "flask_debug"), False)
    DATABASE_FILE: str = _config_item(bool, "TRAGOS_DATABASE_FILE", ("database", "file"), "")

    @staticmethod
    def asdict() -> Dict[str, CONFIG_T]:
        return {
            k: v for k, v in vars(Config).items()
            if not isinstance(v, staticmethod) and not k.startswith("__")
        }


if __name__ == '__main__':
    print(Config.asdict())
