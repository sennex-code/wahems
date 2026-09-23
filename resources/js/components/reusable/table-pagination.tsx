import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';

type TablePaginationType = {
    links: PaginationLink[];
};

export const TablePagination = ({ links }: TablePaginationType) => {
    return (
        <Pagination className="mt-5">
            <PaginationContent>
                {links.map((link, index) => {
                    const label = link.label
                        .replace(/&laquo;/g, '«')
                        .replace(/&raquo;/g, '»');

                    if (!link.url) {
                        return (
                            <PaginationItem key={index}>
                                <span className="cursor-not-allowed px-3 py-2 opacity-50">
                                    {label}
                                </span>
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink
                                isActive={link.active}
                                onClick={() => router.visit(link.url!)}
                                className="cursor-pointer"
                            >
                                {label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </Pagination>
    );
};
