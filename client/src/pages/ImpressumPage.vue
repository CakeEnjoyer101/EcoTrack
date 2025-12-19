<template>
  <div class="impressum-page">
    <div class="impressum-container">
      <h1 class="impressum-title">Impressum</h1>

      <div class="impressum-content">
        <p class="impressum-line">Implementiert von Sven-Erik Reinhart</p>
        <p class="impressum-line">© HTL Wien West, 2025</p>
      </div>

      <div class="navigation-buttons">
        <router-link to="/" class="btn-back">
          ← Zurück zur Startseite
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImpressumPage',

  metaInfo() {
    return {
      title: 'Impressum',
      meta: [
        { name: 'description', content: 'Impressum - Implementiert von Sven-Erik Reinhart, HTL Wien West 2025' }
      ]
    }
  },

  mounted() {
    console.log('Sven-Erik Reinhart');
  },
}
</script>

<style scoped>
.impressum-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.impressum-container {
  max-width: 600px;
  width: 100%;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  border: 1px solid #eaeaea;
}

.impressum-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
}

.impressum-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #3498db, #2ecc71);
  border-radius: 2px;
}

.impressum-content {
  margin: 2.5rem 0;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #3498db;
}

.impressum-line {
  font-size: 1.4rem;
  color: #34495e;
  margin: 1.2rem 0;
  line-height: 1.6;
  font-weight: 500;
}

.impressum-line:first-child {
  font-weight: 600;
  color: #2c3e50;
}

.impressum-line:last-child {
  color: #7f8c8d;
  font-style: italic;
}

.navigation-buttons {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn-back {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-back:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.btn-back:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .impressum-container {
    padding: 2rem;
    margin: 1rem;
  }

  .impressum-title {
    font-size: 2rem;
  }

  .impressum-line {
    font-size: 1.2rem;
  }

  .impressum-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .impressum-page {
    padding: 1rem;
  }

  .impressum-container {
    padding: 1.5rem;
  }

  .impressum-title {
    font-size: 1.8rem;
  }
}
</style>