import { createRouter, createWebHistory } from 'vue-router';
import UploadView from '../views/UploadView.vue';
import DownloadView from '../views/DownloadView.vue';
import PrivacyView from '../views/PrivacyView.vue';
import TermsView from '../views/TermsView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: UploadView,
  },
  {
    path: '/download',
    name: 'Download',
    component: DownloadView,
  },
  {
    path: '/d/:code',
    name: 'DirectDownload',
    component: DownloadView,
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: PrivacyView,
  },
  {
    path: '/terms',
    name: 'Terms',
    component: TermsView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
