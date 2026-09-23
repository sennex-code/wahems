FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    nodejs \
    npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        gd \
        pdo \
        pdo_mysql \
        zip \
        bcmath \
        pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy Laravel application first
COPY . .

# Install PHP dependencies
RUN composer install \
    --optimize-autoloader \
    --no-interaction \
    --no-dev \
    --prefer-dist \
    --no-scripts

# Install Node dependencies
RUN npm install

# Build React/Inertia
RUN npm run build

# Run Laravel optimization
RUN php artisan package:discover --ansi

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=$PORT
