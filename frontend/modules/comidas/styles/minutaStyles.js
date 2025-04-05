import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#690B22',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  minutaSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  minutaTab: {
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMinutaTab: {
    backgroundColor: '#E07A5F',
  },
  minutaTabText: {
    color: '#1B4D3E',
  },
  selectedMinutaTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  minutaDetails: {
    marginTop: 10,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  detailsSubheader: {
    fontSize: 16,
    color: '#690B22',
    marginTop: 4,
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  mealGroup: {
    marginBottom: 20,
  },
  mealHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
    backgroundColor: '#F8E8D8',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  mealItem: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B4D3E',
  },
  mealItemDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    paddingLeft: 15,
  },
  printButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
