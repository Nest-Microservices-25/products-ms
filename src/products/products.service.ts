import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('🧡 Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPages / limit);
    const data = await this.product.findMany({
      where: {
        available: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
        available: true,
      },
    });
    if (product) {
      return product;
    } else {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with ID ${id} not found`,
      });
      // throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);
    return this.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({
    //   where: {
    //     id,
    //   },
    // });
    const product = await this.product.update({
      where: {
        id,
      },
      data: {
        available: false,
      },
    });
    return product;
  }
  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    if (products.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Some products are not valid`,
      });
    }
    return products;
  }
}
