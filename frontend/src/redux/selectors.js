export function getCounters (store) {
    return store ? store.counters.filter(counter => counter.active).map(counter => {return {text: counter.text, value: counter.value}}) : [];
}
export const getReferences = store => store ? store.references : [];
export const getTrends = store => store ? store.trends : {};

export const isLoading = store => store ? store.isLoading : false;
export const getError = store => store ? store.error : null;