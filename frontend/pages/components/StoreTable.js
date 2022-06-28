import StoreRow from "./StoreRow";
/**
 * Receives the stores and maps them to seperate rows
 * @param filteredStores The all the stores that are filtered when searching for a store, default is all stores
 * @returns A div containing a list of the stores
 */
function StoreTable({filteredStores, link, linktwo}){
  const storelist = filteredStores.map(store => <StoreRow store={store} link={link} linktwo={linktwo} from={true} />);
  return <div>{storelist}</div>
}

export default StoreTable;