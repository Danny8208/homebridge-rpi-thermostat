import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import axios from 'axios';

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('rpi-thermostat', RaspberryPiThermostat);
};

class RaspberryPiThermostat implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly thermostat_api: string;
  private readonly api_key: string;
  private readonly thermostatService: Service;

  constructor(
    log: Logging,
    config: AccessoryConfig,
  ) {
    this.log = log;
    this.name = config.name;
    this.thermostat_api = config.thermostat_api;
    this.api_key = config.api_key;
    this.thermostatService = new hap.Service.Thermostat;

    this.thermostatService.getCharacteristic(hap.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemp.bind(this));
    this.thermostatService.getCharacteristic(hap.Characteristic.TargetTemperature)
      .onGet(this.getTargetTemp.bind(this))
      .onSet(this.setTargetTemp.bind(this));
    this.thermostatService.getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
      .onGet(this.getTargetHeatCoolState.bind(this))
      .onSet(this.setTargetHeatCoolState.bind(this));
    this.thermostatService.getCharacteristic(hap.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentHeatCoolState.bind(this));
    this.thermostatService.getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getTempDisplayUnits.bind(this))
      .onSet(this.setTempDisplayUnits.bind(this));
  }

  async getCurrentTemp() {
    const request = await axios.get(this.thermostat_api);
    const currentTemp = request.data['current_temp'];
    this.log.debug('get current temp', currentTemp);
    return currentTemp;
  }

  async getTargetTemp() {
    const request = await axios.get(this.thermostat_api);
    const targetTemp = request.data['target_temp'];
    this.log.debug('get target temp', targetTemp);
    return targetTemp;
  }

  async setTargetTemp(target) {
    await axios.post(this.thermostat_api, {
      target_temp: target,
      api_key: this.api_key,
    });
    this.log.debug('set target temp', target);
  }

  async getTargetHeatCoolState() {
    const request = await axios.get(this.thermostat_api);
    const targetHeatCoolState = request.data['target_heat_cool_state'];
    this.log('get target heat cool state', targetHeatCoolState);
    return targetHeatCoolState;
  }

  async setTargetHeatCoolState(target) {
    await axios.post(this.thermostat_api, {
      target_heat_cool_state: target,
      api_key: this.api_key,
    });
    this.log.debug('set target heat cool state', target);
  }

  async getCurrentHeatCoolState() {
    const request = await axios.get(this.thermostat_api);
    const currentHeatCoolState = request.data['current_heat_cool_state'];
    this.log('get current heat cool state');
    return currentHeatCoolState;
  }

  async getTempDisplayUnits() {
    const request = await axios.get(this.thermostat_api);
    const tempDisplayUnits = request.data['temp_display_units'];
    this.log.debug('get temp display units', tempDisplayUnits);
    return tempDisplayUnits;
  }

  async setTempDisplayUnits(target) {
    await axios.post(this.thermostat_api, {
      temp_display_units: target,
      api_key: this.api_key,
    });
    this.log.debug('set temp display units', target);
  }

  getServices(): Service[] {
    return [this.thermostatService];
  }
}