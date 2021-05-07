export const getCloudState = state => state.cloud;

export const getCounters = store => getCloudState(store) ? getCloudState(store).counters.filter(counter => counter.active).map(counter => {return {text: counter.text, value: counter.value, cluster: counter.cluster}}) : [];
export const getReferences = store => getCloudState(store) ? getCloudState(store).references : [];
export const getTrends = store => getCloudState(store) ? getCloudState(store).trends : {};
export const getDescriptions = store => getCloudState(store) ? getCloudState(store).descriptions : {};
export const isLoading = store => getCloudState(store) ? getCloudState(store).isLoading : false;
export const getError = store => getCloudState(store) ? getCloudState(store).error : null;
export const getRedraw = store => getCloudState(store) ? getCloudState(store).redraw : false;