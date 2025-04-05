import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 5,
  },
  statLabel: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: '#1B4D3E',
    fontSize: 14,
    textAlign: 'center',
  },
  recentActivity: {
    padding: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  activityInfo: {
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#690B22',
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  debugRoleButtons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  debugRoleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeRoleButton: {
    backgroundColor: '#E07A5F',
    borderColor: '#690B22',
  },
  debugRoleText: {
    fontSize: 10,
    color: '#333',
  },
  debugWarning: {
    fontSize: 10,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%'
  },
  resetRoleButton: {
    marginTop: 5,
    backgroundColor: '#607D8B',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '100%'
  },
  resetRoleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
});
