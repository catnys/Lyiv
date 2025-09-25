import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async getOverview() {
    const response = await this.api.get('/overview');
    return response.data;
  }

  async getPerformance() {
    const response = await this.api.get('/performance');
    return response.data;
  }

  async getSpills(limit = 100) {
    const response = await this.api.get(`/spills?limit=${limit}`);
    return response.data;
  }

  async getInstructionMix() {
    const response = await this.api.get('/instruction-mix');
    return response.data;
  }

  async getSpillTimeline() {
    const response = await this.api.get('/spill-timeline');
    return response.data;
  }

  async getSpillHeatmap() {
    const response = await this.api.get('/spill-heatmap');
    return response.data;
  }

  async getMemory() {
    const response = await this.api.get('/memory');
    return response.data;
  }

  async getStatus() {
    const response = await this.api.get('/status');
    return response.data;
  }

  async reloadData() {
    const response = await this.api.get('/reload');
    return response.data;
  }
}
