import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 16,
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  selectedCategoryButton: {
    backgroundColor: '#E07A5F',
  },
  categoryButtonText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  typeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedTypeButton: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  recetaCard: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recetaImage: {
    height: 150,
  },
  recetaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginVertical: 8,
  },
  recetaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#F1E3D3',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
  },
  typeTag: {
    backgroundColor: '#E9F5E9',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#4CAF50',
  },
  typeTagText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  recetaDescription: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#1B4D3E',
  },
  tipoComidaIcon: {
    marginRight: 6,
  },
  tipoComidaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipoComidaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
